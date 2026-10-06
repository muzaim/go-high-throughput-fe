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

// Global BroadcastChannel for instant multi-tab synchronization
const stockChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('surya_store_sse_sync')
  : null;

export function useInventory(itemId: string, fallbackPollIntervalMs = 4000): UseInventoryReturn {
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
    if (stockChannel) {
      stockChannel.postMessage({ type: 'REFETCH_STOCK', itemId: itemId.trim() });
    }
  }, [fetchStock, itemId]);

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

  // Listen to BroadcastChannel for multi-tab synchronization
  useEffect(() => {
    if (!stockChannel || !itemId.trim()) return;

    const handleChannelMessage = (event: MessageEvent) => {
      if (event.data?.itemId === itemId.trim()) {
        fetchStock(false);
      }
    };

    stockChannel.addEventListener('message', handleChannelMessage);

    return () => {
      stockChannel.removeEventListener('message', handleChannelMessage);
    };
  }, [itemId, fetchStock]);

  // Initial HTTP stock fetch when itemId changes
  useEffect(() => {
    setStock(null);
    setIsLoading(true);
    fetchStock(false);
  }, [itemId, fetchStock]);

  const handleInventoryUpdated = useCallback(() => {
    fetchStock(false);
    if (stockChannel) {
      stockChannel.postMessage({ type: 'REFETCH_STOCK', itemId: itemId.trim() });
    }
  }, [fetchStock, itemId]);

  // Native EventSource SSE Stream Hook
  const { status: sseStatus } = useInventoryStream({
    itemId,
    onInventoryUpdated: handleInventoryUpdated,
  });

  // SMART FALLBACK POLLING:
  // - If SSE is 'connected' (Live): Periodic HTTP polling is DISABLED (0 reqs).
  // - If SSE is 'connecting' or 'disconnected': Silent background polling activates automatically (every 4s)
  //   so stock updates NEVER stop working even if SSE stream drops!
  useEffect(() => {
    if (sseStatus === 'connected' || fallbackPollIntervalMs <= 0) return;

    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        fetchStock(false);
      }
    }, fallbackPollIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [itemId, sseStatus, fallbackPollIntervalMs, fetchStock]);

  // When SSE transitions to 'connected', instantly trigger one fresh stock refetch
  useEffect(() => {
    if (sseStatus === 'connected') {
      fetchStock(false);
    }
  }, [sseStatus, fetchStock]);

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
