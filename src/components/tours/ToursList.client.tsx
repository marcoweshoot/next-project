// app/viaggi-fotografici/ToursList.client.tsx
'use client';

import { useCallback, useDeferredValue, useEffect, useRef, useState, useTransition } from 'react';
import ToursHero from '@/components/tours/ToursHero';
import ToursContent from '@/components/tours/ToursContent';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { request } from 'graphql-request';
import { GET_TOURS } from '@/graphql/queries';
import { transformTours } from '@/utils/TourDataUtilis';
import type { Tour } from '@/types';

const TOURS_PER_PAGE = 6;

/** Deduplica per slug (fallback su id, poi indice) */
function dedupeTours(list: Tour[]) {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: Tour[] = [];
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (!t || typeof t !== 'object') continue;
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

// Supporto AbortSignal
async function searchApi(q: string, offset = 0, limit = TOURS_PER_PAGE, signal?: AbortSignal) {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`,
    { method: 'GET', cache: 'no-store', signal }
  );
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
  // 🔁 contatore richieste attive per evitare "loading infinito"
  const searchActiveCountRef = useRef(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);

  const [isPending, startTransition] = useTransition();
  const searchAbortRef = useRef<AbortController | null>(null);
  const loadMoreAbortRef = useRef<AbortController | null>(null);
  const querySeqRef = useRef(0); // id sequenziale della query corrente

  // àncora results per scroll
  const resultsRef = useRef<HTMLElement | null>(null);

  // 🔥 Warm-up dell’endpoint (cold start)
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/search?q=__warmup&limit=1`, { signal: ctrl.signal, cache: 'no-store' }).catch(() => {});
    return () => ctrl.abort();
  }, []);

  // esegue la ricerca su /api/search (prima pagina)
  const runSearch = useCallback(
    async (q: string) => {
      const term = q.trim();

      // Cancella eventuale richiesta precedente
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }

      if (!term) {
        // reset ricerca
        startTransition(() => {
          setSearchTours(null);
          setSearchHasMore(false);
          setSearchLoading(false);
        });
        return;
      }

      const seq = ++querySeqRef.current;
      const controller = new AbortController();
      searchAbortRef.current = controller;

      // gestione contatore loading
      searchActiveCountRef.current += 1;
      setSearchLoading(true);

      try {
        const { tours, hasMore } = await searchApi(term, 0, TOURS_PER_PAGE, controller.signal);

        // ignora risposte vecchie o abortite
        if (seq !== querySeqRef.current || controller.signal.aborted) return;

        startTransition(() => {
          setSearchTours(dedupeTours(tours));
          setSearchHasMore(hasMore);
        });
      } catch (e) {
        if ((e as any)?.name !== 'AbortError') {
          console.error(e);
          // mostriamo risultato vuoto solo se è la query corrente
          if (seq === querySeqRef.current) {
            startTransition(() => {
              setSearchTours([]);
              setSearchHasMore(false);
            });
          }
        }
      } finally {
        // decrementa contatore e aggiorna stato loading
        searchActiveCountRef.current = Math.max(0, searchActiveCountRef.current - 1);
        if (searchActiveCountRef.current === 0) setSearchLoading(false);
      }
    },
    []
  );

  // load more: gestisce sia browse che search
  const loadMore = useCallback(async () => {
    // ---- ricerca attiva ----
    if (searchTours) {
      if (!searchHasMore || searchLoadingMore) return;

      // Cancella eventuale "load more" precedente in ricerca
      if (loadMoreAbortRef.current) {
        loadMoreAbortRef.current.abort();
      }
      const controller = new AbortController();
      loadMoreAbortRef.current = controller;

      setSearchLoadingMore(true);
      try {
        const { tours, hasMore } = await searchApi(
          deferredSearch,
          searchTours.length,
          TOURS_PER_PAGE,
          controller.signal
        );
        if (controller.signal.aborted) return;

        startTransition(() => {
          setSearchTours(prev => (prev ? dedupeTours([...prev, ...tours]) : dedupeTours(tours)));
          setSearchHasMore(hasMore);
        });
      } catch (e) {
        if ((e as any)?.name !== 'AbortError') {
          console.error(e);
        }
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
      startTransition(() => {
        setBrowseTours(next);
        setBrowseHasMore(page.length === TOURS_PER_PAGE);
      });
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
      // annulla fetch pendenti della ricerca
      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (loadMoreAbortRef.current) loadMoreAbortRef.current.abort();

      // azzera contatore e stato
      searchActiveCountRef.current = 0;
      startTransition(() => {
        setSearchTours(null);
        setSearchHasMore(false);
        setSearchLoading(false);
      });
    }
  }, [deferredSearch, searchTours]);

  // ⏱️ RIMOSSO il debounce extra: parte subito quando cambia deferredSearch
  useEffect(() => {
    if (deferredSearch.trim()) {
      runSearch(deferredSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch]);

  // pulizia: aborta richieste quando il componente si smonta
  useEffect(() => {
    return () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (loadMoreAbortRef.current) loadMoreAbortRef.current.abort();
      searchActiveCountRef.current = 0;
    };
  }, []);

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
          // Ricerca immediata su submit
          await runSearch(searchTerm);
        }}
      />

      <section id="tours-list" ref={resultsRef} className="scroll-mt-24">
        <ToursContent
          tours={visibleTours}
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
