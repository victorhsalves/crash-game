import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { gameApi } from "@/services/game/game.api";
import type { BetHistoryItem } from "@/types/game.types";

const PAGE_SIZE = 20;

interface UseBetHistoryOptions {
  isOpen: boolean;
}

export function useBetHistory({ isOpen }: UseBetHistoryOptions) {
  const { isAuthenticated, isInitialized } = useAuth();
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<BetHistoryItem[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const query = useQuery({
    queryKey: ["games", "bets", "me", PAGE_SIZE, offset],
    queryFn: () => gameApi.getMyBets(PAGE_SIZE, offset),
    enabled: isInitialized && isAuthenticated && isOpen,
  });

  useEffect(() => {
    if (!isOpen) {
      setOffset(0);
      setItems([]);
      setHasMore(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    setHasMore(query.data.items.length === PAGE_SIZE);

    if (offset === 0) {
      setItems(query.data.items);
      return;
    }

    setItems((current) => [...current, ...query.data!.items]);
  }, [query.data, offset]);

  const loadMore = useCallback(() => {
    if (!hasMore || query.isFetching) {
      return;
    }

    setOffset((current) => current + PAGE_SIZE);
  }, [hasMore, query.isFetching]);

  const reset = useCallback(() => {
    setOffset(0);
    setItems([]);
    setHasMore(false);
  }, []);

  return {
    items,
    isLoading: isOpen && offset === 0 && query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    loadMore,
    hasMore,
    isLoadingMore: isOpen && offset > 0 && query.isFetching,
    reset,
  };
}
