import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryApi } from '../services/inventoryApi';
import { StockResponse, SseStatus } from '../types/inventory';
import { ApiError } from '../services/api';
import { useInventoryStream } from './useInventoryStream';

interface UseInventoryReturn {
  stock: StockResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  sseStatus: SseStatus;
  error: ApiError | null;
  lastUpdated: Date | null;
  refetchStock: () => Promise<void>;
  clearError: () => void;
}

export function useInventory(itemId: string): UseInventoryReturn {
  const [stock, setStock] = useState<StockResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const stockRef = useRef<StockResponse | null>(null);
  stockRef.current = stock;

  const fetchStock = useCallback(
    async (isManual = false) => {
      if (!itemId.trim()) return;

      if (isManual) {
        setIsRefreshing(true);
      } else if (!stockRef.current) {
        setIsLoading(true);
      }

      try {
        const data = await inventoryApi.getStock(itemId);
        if (isMountedRef.current) {
          setStock(data);
          setLastUpdated(new Date());
          setError(null);
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

  // Track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initial HTTP stock fetch when itemId changes
  useEffect(() => {
    setStock(null);
    setIsLoading(true);
    fetchStock(false);
  }, [itemId, fetchStock]);

  // Connect native EventSource SSE stream.
  // When 'inventory_updated' event is received, fetchStock() is invoked to query PostgreSQL source-of-truth.
  const { status: sseStatus } = useInventoryStream({
    itemId,
    onInventoryUpdated: () => fetchStock(false),
  });

  return {
    stock,
    isLoading,
    isRefreshing,
    sseStatus,
    error,
    lastUpdated,
    refetchStock,
    clearError,
  };
}
