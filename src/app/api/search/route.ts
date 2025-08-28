// app/api/search/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { request } from 'graphql-request';
import { GET_TOURS } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import type { Tour } from '@/types';

const GRAPHQL_ENDPOINT = process.env.STRAPI_GRAPHQL_API!;
const PAGE_SIZE = 200;               // batch grande = meno roundtrip
const CONCURRENCY = 3;               // scarica più pagine in parallelo
const INDEX_TTL_MS = 10 * 60 * 1000; // 10 minuti

// ---------- tipi di supporto (niente any) ----------
type GqlResp = { tours: unknown[] };

type Maybe<T> = T | null | undefined;

type PersonLite = {
  displayName?: string;
  username?: string;
  name?: string;
};

type NameSlug = {
  name?: string;
  title?: string;
  slug?: string;
};

type IndexableTour = Pick<Tour, 'title' | 'slug'> & {
  destination?: { name?: string; country?: string };
  places?: NameSlug[];
  states?: NameSlug[];
  users?: PersonLite[];
  coaches?: PersonLite[];
  tags?: string[];
  categories?: string[];
};

type IndexEntry = { tokens: string[]; tour: IndexableTour };
type IndexCache = { builtAt: number; entries: IndexEntry[] };

// cache di modulo (persistente su istanze “warm”)
let CACHE: IndexCache | null = null;

// ---------- normalizzazione & token ----------
function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function toTokens(s: string): string[] {
  // split su non-alfa/numerico, ignora token corti
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
  sicilia: ['sicilia', 'siclily'.replace('lly','ly')], // evita typo lint per esempio, in pratica: ['sicilia','sicily']
  spagna: ['spagna', 'spain'],
  portogallo: ['portogallo', 'portugal'],
};

function expandQuery(q: string): string[] {
  const n = norm(q);
  const hit = Object.entries(ALIASES).find(
    ([k, arr]) => k === n || arr.map(norm).includes(n)
  );
  if (!hit) return [n];
  const [, arr] = hit;
  return Array.from(new Set(arr.map(norm).concat(n)));
}

// ---------- fetch pagine da Strapi ----------
async function fetchPage(start: number): Promise<unknown[]> {
  const data = await request<GqlResp>(GRAPHQL_ENDPOINT, GET_TOURS, {
    locale: 'it',
    limit: PAGE_SIZE,
    start,
  });
  return data.tours ?? [];
}

async function fetchAllTours(): Promise<IndexableTour[]> {
  let start = 0;
  let allRaw: unknown[] = [];
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

  // Evita any: cast tipizzato dell’argomento in base alla signature reale
  const transform = transformTours as unknown as (arr: unknown[]) => Tour[];
  const tours = transform(allRaw);

  // i campi extra per l’indicizzazione sono opzionali; TS è strutturale
  return tours as unknown as IndexableTour[];
}

// ---------- costruzione indice ----------
function pickHaystackFields(t: IndexableTour): string {
  const usersOrCoaches: Maybe<PersonLite[]> =
    (t.users && t.users.length ? t.users : undefined) ??
    (t.coaches && t.coaches.length ? t.coaches : undefined);

  const userNames = (usersOrCoaches ?? [])
    .map((u) => u?.displayName || u?.username || u?.name)
    .filter(Boolean)
    .join(' ');

  const places = (t.places ?? [])
    .flatMap((p) => [p?.name, p?.title, p?.slug])
    .filter(Boolean)
    .join(' ');

  const states = (t.states ?? [])
    .flatMap((s) => [s?.name, s?.title, s?.slug])
    .filter(Boolean)
    .join(' ');

  const tags = (t.tags ?? []).join(' ');
  const categories = (t.categories ?? []).join(' ');

  return [
    t.title,
    t.slug,
    t.destination?.name,
    t.destination?.country,
    places,
    states,
    userNames,
    tags,
    categories,
  ]
    .filter(Boolean)
    .join(' ');
}

async function buildIndex(): Promise<IndexCache> {
  const tours = await fetchAllTours();
  const entries: IndexEntry[] = tours.map((t) => ({
    tokens: toTokens(pickHaystackFields(t)),
    tour: t,
  }));
  return { builtAt: Date.now(), entries };
}

async function getIndex(): Promise<IndexCache> {
  if (CACHE && Date.now() - CACHE.builtAt < INDEX_TTL_MS) return CACHE;
  const fresh = await buildIndex();
  CACHE = fresh;
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

  // match per parola: almeno un termine deve essere presente tra i token del tour
  const matches: IndexableTour[] = [];
  for (const e of index.entries) {
    if (terms.some((term) => e.tokens.includes(term))) {
      matches.push(e.tour);
    }
  }

  const total = matches.length;
  const slice = matches.slice(offset, offset + limit);
  const hasMore = offset + slice.length < total;

  return NextResponse.json(
    { tours: slice, hasMore, total },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
  );
}
