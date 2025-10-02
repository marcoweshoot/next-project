"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export const useInfiniteScroll = ({ hasMore, isLoading, onLoadMore }: UseInfiniteScrollProps) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) {
        return;
      }
      if (hasMore && !isLoading && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, isFetching]);

  useEffect(() => {
    if (!isFetching) return;
    
    const fetchMoreData = async () => {
      await onLoadMore();
      setIsFetching(false);
    };

    fetchMoreData();
  }, [isFetching, onLoadMore]);

  return { isFetching };
};
