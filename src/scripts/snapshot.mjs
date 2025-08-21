import fs from 'node:fs/promises';
import path from 'node:path';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const OUT_DIR = path.join(process.cwd(), 'public', 'snapshots');
const PICTURES_LIMIT = 10;

async function fetchGQL(query, variables = {}) {
  const timeoutMs = 10000;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${STRAPI_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Strapi ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    return json.data;
  } finally {
    clearTimeout(t);
  }
}


async function fetchWithRetry(fn, { tries = 3, baseMs = 400 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      const delay = baseMs * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

function limit(fn, max = 5) {
  let running = 0;
  const queue = [];
  
  return function(...args) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, args, resolve, reject });
      processQueue();
    });
  };
  
  function processQueue() {
    if (running >= max || queue.length === 0) return;
    running++;
    const { fn, args, resolve, reject } = queue.shift();
    fn(...args).then(resolve).catch(reject).finally(() => {
      running--;
      processQueue();
    });
  }
}

// Main execution
async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });


// 1) Lista di tutte le pagine che vuoi generare
const listQuery = `
{
tours {
slug
states { slug }
places { slug }
}
}
`;


const listData = await fetchWithRetry(() => fetchGQL(listQuery));
const tours = listData?.tours ?? [];


await fs.writeFile(path.join(OUT_DIR, 'tours.json'), JSON.stringify(tours, null, 2));
console.log(`Trovati ${tours.length} tour. Inizio snapshot dettagli...`);


// 2) Dettaglio per ogni tour – LIMITA ai campi minimi necessari al render SSG
const detailQuery = `
query($slug:String!, $limit:Int!) {
tour(slug:$slug) {
title
slug
states { slug }
places { slug }
sessions(future:true) { start end price }
pictures(limit:$limit) { id url alt title width height }
}
}
`;


let ok = 0, ko = 0;
await Promise.all(
tours.map(t => limit(async () => {
try {
const data = await fetchWithRetry(() => fetchGQL(detailQuery, { slug: t.slug, limit: PICTURES_LIMIT }));
const file = path.join(OUT_DIR, `tour.${t.slug}.json`);
await fs.writeFile(file, JSON.stringify(data.tour ?? null));
ok++;
} catch (err) {
ko++;
console.warn(`[SNAPSHOT] tour ${t.slug} errore:`, err?.message ?? err);
}
}))
);


  console.log(`Snapshot completato. OK=${ok} KO=${ko}. File in ${OUT_DIR}`);
}

// Run the script
main().catch(console.error);