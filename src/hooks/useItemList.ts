import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryApi } from '../services/inventoryApi';
import { StockResponse } from '../types/inventory';
import { ApiError } from '../services/api';

interface UseItemListReturn {
  items: StockResponse[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: ApiError | null;
  refetchItems: () => Promise<void>;
}

export function useItemList(pollIntervalMs = 8000): UseItemListReturn {
  const [items, setItems] = useState<StockResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const isMountedRef = useRef(true);

  const fetchItems = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const response = await inventoryApi.getAllItems();
      if (isMountedRef.current) {
        setItems(response.items || []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(
            new ApiError('Failed to fetch item catalog', 'CATALOG_ERROR', 500)
          );
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const refetchItems = useCallback(async () => {
    await fetchItems(true);
  }, [fetchItems]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchItems(false);

    if (pollIntervalMs <= 0) return;

    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        fetchItems(false);
      }
    }, pollIntervalMs);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [pollIntervalMs, fetchItems]);

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    refetchItems,
  };
}
