// app/api/search/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { request } from 'graphql-request';
import { GET_TOURS } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import type { Tour } from '@/types';

const GRAPHQL_ENDPOINT = process.env.STRAPI_GRAPHQL_API!;
const PAGE_SIZE = 200;         // batch grandi = meno roundtrip
const CONCURRENCY = 3;         // scarica più pagine in parallelo
const INDEX_TTL_MS = 10 * 60 * 1000; // 10 minuti di TTL indice

type GqlResp = { tours: any[] };

function norm(s: unknown) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
function toTokens(s: string) {
  // split su non-alfa/numerico, ignora token corti (evita falsi positivi)
  return norm(s).split(/[^a-z0-9]+/i).filter((t) => t.length >= 3);
}

// Alias IT ⇄ EN (puoi estendere liberamente)
const ALIASES: Record<string, string[]> = {
  italia: ['italia', 'italy', 'ita'],
  islanda: ['islanda', 'iceland'],
  marocco: ['marocco', 'morocco', 'maroc'],
  toscana: ['toscana', 'tuscany'],
  liguria: ['liguria', 'cinque terre', 'cinqueterre', '5 terre'],
  dolomiti: ['dolomiti', 'dolomites', 'alto adige', 'south tyrol', 'sudtirolo', 'südtirol', 'trentino'],
  sicilia: ['sicilia', 'sicily'],
  spagna: ['spagna', 'spain'],
  portogallo: ['portogallo', 'portugal'],
};
function expandQuery(q: string) {
  const n = norm(q);
  const hit = Object.entries(ALIASES).find(([k, arr]) => k === n || arr.map(norm).includes(n));
  if (!hit) return [n];
  const [, arr] = hit;
  return Array.from(new Set(arr.map(norm).concat(n)));
}

// ---------- fetch pagine da Strapi ----------
async function fetchPage(start: number) {
  const data = await request<GqlResp>(GRAPHQL_ENDPOINT, GET_TOURS, {
    locale: 'it',
    limit: PAGE_SIZE,
    start,
  });
  return data.tours ?? [];
}

async function fetchAllTours(): Promise<Tour[]> {
  let start = 0;
  let allRaw: any[] = [];
  let more = true;

  while (more) {
    const starts: number[] = [];
    for (let i = 0; i < CONCURRENCY; i++) starts.push(start + i * PAGE_SIZE);

    const batches = await Promise.all(starts.map((s) => fetchPage(s)));
    const lastBatchSizes = batches.map((b) => b.length);

    allRaw = allRaw.concat(...batches);
    more = lastBatchSizes.some((len) => len === PAGE_SIZE);
    start += CONCURRENCY * PAGE_SIZE;
  }

  return transformTours(allRaw) as Tour[];
}

// ---------- indice in memoria ----------
type IndexEntry = { tokens: string[]; tour: Tour };
type IndexCache = { builtAt: number; entries: IndexEntry[] };

declare global {
  // eslint-disable-next-line no-var
  var __TOUR_SEARCH_CACHE: IndexCache | undefined;
}

function pickHaystackFields(t: any) {
  // solo campi utili (NO description → niente “italiano” come falso positivo)
  return [
    t.title,
    t.slug,
    t?.destination?.name,
    t?.destination?.country,
    ...(t.places || []).flatMap((p: any) => [p?.name, p?.title, p?.slug]),
    ...(t.states || []).flatMap((s: any) => [s?.name, s?.title, s?.slug]),
    (t.users || t.coaches || [])
      .map((u: any) => u?.displayName || u?.username || u?.name)
      .join(' '),
    (t.tags || []).join(' '),
    (t.categories || []).join(' '),
  ]
    .filter(Boolean)
    .join(' ');
}

async function buildIndex(): Promise<IndexCache> {
  const tours = await fetchAllTours();
  const entries: IndexEntry[] = tours.map((t) => ({
    tokens: toTokens(pickHaystackFields(t as any)),
    tour: t,
  }));
  return { builtAt: Date.now(), entries };
}

async function getIndex(): Promise<IndexCache> {
  const cache = globalThis.__TOUR_SEARCH_CACHE;
  if (cache && Date.now() - cache.builtAt < INDEX_TTL_MS) return cache;
  const fresh = await buildIndex();
  globalThis.__TOUR_SEARCH_CACHE = fresh;
  return fresh;
}

// ---------- handler ----------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit') ?? '6')));
  const offset = Math.max(0, Number(searchParams.get('offset') ?? '0'));

  if (!q.trim()) {
    return NextResponse.json(
      { tours: [], hasMore: false, total: 0 },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const terms = expandQuery(q);
  const index = await getIndex();

  // match per parola: basta che un termine sia presente fra i tokens del tour
  const matches: Tour[] = [];
  for (const e of index.entries) {
    if (terms.some((term) => e.tokens.includes(term))) {
      matches.push(e.tour);
    }
  }

  const total = matches.length;
  const slice = matches.slice(offset, offset + limit);
  const hasMore = offset + slice.length < total;

  // cache CDN breve per rendere “snappy” ricerche ripetute
  return NextResponse.json(
    { tours: slice, hasMore, total },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
  );
}
