import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryApi } from '../services/inventoryApi';
import { StockResponse } from '../types/inventory';
import { ApiError } from '../services/api';

interface UseInventoryReturn {
  stock: StockResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: ApiError | null;
  lastUpdated: Date | null;
  refetchStock: () => Promise<void>;
  clearError: () => void;
}

export function useInventory(itemId: string, pollIntervalMs = 8000): UseInventoryReturn {
  const [stock, setStock] = useState<StockResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const stockRef = useRef<StockResponse | null>(null);

  // Keep stockRef in sync to avoid stock dependency in useCallback
  useEffect(() => {
    stockRef.current = stock;
  }, [stock]);

  const fetchStock = useCallback(
    async (isManualRefresh = false) => {
      if (!itemId.trim()) return;

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!stockRef.current) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await inventoryApi.getStock(itemId);
        if (isMountedRef.current) {
          setStock(data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (isMountedRef.current) {
          if (err instanceof ApiError) {
            setError(err);
          } else {
            setError(
              new ApiError('Failed to fetch stock information', 'UNKNOWN_ERROR', 500)
            );
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [itemId]
  );

  const refetchStock = useCallback(async () => {
    await fetchStock(true);
  }, [fetchStock]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initial fetch and automatic polling interval
  useEffect(() => {
    setStock(null);
    setIsLoading(true);

    fetchStock(false);

    if (pollIntervalMs <= 0) return;

    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        fetchStock(false);
      }
    }, pollIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [itemId, pollIntervalMs, fetchStock]);

  return {
    stock,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refetchStock,
    clearError,
  };
}
