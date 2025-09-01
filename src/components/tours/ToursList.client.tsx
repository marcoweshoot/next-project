// app/viaggi-fotografici/ToursList.client.tsx
'use client';

import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import ToursHero from '@/components/tours/ToursHero';
import ToursContent from '@/components/tours/ToursContent';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { request } from 'graphql-request';
import { GET_TOURS } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import type { Tour } from '@/types';

const TOURS_PER_PAGE = 6;

/** Deduplica per slug (fallback su id) */
/** Deduplica per slug (fallback su id, poi indice) */
function dedupeTours(list: Tour[]) {
  if (!Array.isArray(list)) return [];

  const seen = new Set<string>();
  const out: Tour[] = [];

  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (!t || typeof t !== "object") continue;

    // 👇 chiave stabile: id → slug → indice
    const keyBase = (t as any).id ?? (t as any).slug ?? `i-${i}`;
    const key = String(keyBase);

    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }

  return out;
}


async function fetchMore(start: number) {
  const data = await request<{ tours: any[] }>(
    process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_API!,
    GET_TOURS,
    { locale: 'it', limit: TOURS_PER_PAGE, start }
  );
  return transformTours(data.tours) as Tour[];
}

async function searchApi(q: string, offset = 0, limit = TOURS_PER_PAGE) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`, {
    method: 'GET',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Search API error');
  return (await res.json()) as { tours: Tour[]; hasMore: boolean; total?: number };
}

export default function ToursList({
  initialTours,
  heroImage,
}: {
  initialTours: Tour[];
  heroImage: any;
}) {
  // ----- modalità "sfoglia" (nessuna ricerca) -----
  const [browseTours, setBrowseTours] = useState<Tour[]>(dedupeTours(initialTours));
  const [browseHasMore, setBrowseHasMore] = useState(initialTours.length === TOURS_PER_PAGE);
  const [browseLoadingMore, setBrowseLoadingMore] = useState(false);

  // ----- modalità "ricerca" -----
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [searchTours, setSearchTours] = useState<Tour[] | null>(null);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);

  // àncora results per scroll
  const resultsRef = useRef<HTMLElement | null>(null);

  // esegue la ricerca su /api/search (prima pagina)
  const runSearch = useCallback(
    async (q: string) => {
      const term = q.trim();
      if (!term) {
        setSearchTours(null);
        setSearchHasMore(false);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      try {
        const { tours, hasMore } = await searchApi(term, 0, TOURS_PER_PAGE);
        setSearchTours(dedupeTours(tours));
        setSearchHasMore(hasMore);
      } catch (e) {
        console.error(e);
        setSearchTours([]);
        setSearchHasMore(false);
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

  // load more: gestisce sia browse che search
  const loadMore = useCallback(async () => {
    // ---- ricerca attiva ----
    if (searchTours) {
      if (!searchHasMore || searchLoadingMore) return;
      setSearchLoadingMore(true);
      try {
        const { tours, hasMore } = await searchApi(deferredSearch, searchTours.length, TOURS_PER_PAGE);
        setSearchTours(prev =>
          prev ? dedupeTours([...prev, ...tours]) : dedupeTours(tours)
        );
        setSearchHasMore(hasMore);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoadingMore(false);
      }
      return;
    }

    // ---- sfoglia ----
    if (!browseHasMore || browseLoadingMore) return;
    setBrowseLoadingMore(true);
    try {
      const page = await fetchMore(browseTours.length);
      const next = dedupeTours([...browseTours, ...page]);
      setBrowseTours(next);
      setBrowseHasMore(page.length === TOURS_PER_PAGE);
    } finally {
      setBrowseLoadingMore(false);
    }
  }, [
    searchTours,
    searchHasMore,
    searchLoadingMore,
    deferredSearch,
    browseHasMore,
    browseLoadingMore,
    browseTours,
  ]);

  // infinite scroll su entrambe le modalità
  const { isFetching } = useInfiniteScroll({
    hasMore: searchTours ? searchHasMore : browseHasMore,
    isLoading: (searchTours ? searchLoadingMore : browseLoadingMore) || searchLoading,
    onLoadMore: loadMore,
  });

  // quando si cancella la ricerca (input vuoto), torna alla modalità sfoglia
  useEffect(() => {
    if (deferredSearch.trim() === '' && searchTours) {
      setSearchTours(null);
      setSearchHasMore(false);
    }
  }, [deferredSearch, searchTours]);

  // Ottimizzazione: ricerca automatica solo dopo un delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (deferredSearch.trim()) {
        runSearch(deferredSearch);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [deferredSearch, runSearch]);

  const visibleTours = searchTours ?? browseTours;
  const loading = searchLoading;
  const loadingMore = (searchTours ? searchLoadingMore : browseLoadingMore) || isFetching;
  const hasMore = searchTours ? searchHasMore : browseHasMore;

  return (
    <>
      <ToursHero
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        heroImage={heroImage}
        resultsRef={resultsRef}
        resultsOffsetPx={96}
        onSubmitSearch={async () => {
          // Ricerca immediata solo su submit esplicito
          await runSearch(searchTerm);
        }}
      />

      <section id="tours-list" ref={resultsRef} className="scroll-mt-24">
        <ToursContent
          tours={visibleTours}   // 👉 niente filtro interno
          loading={loading}
          loadingMore={loadingMore}
          error={null}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm('')}
          hasMore={hasMore}
        />
      </section>
    </>
  );
}
