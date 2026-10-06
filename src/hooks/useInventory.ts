import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryApi } from '../services/inventoryApi';
import { StockResponse } from '../types/inventory';
import { ApiError } from '../services/api';

interface UseInventoryReturn {
  stock: StockResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isRealtimeConnected: boolean;
  error: ApiError | null;
  lastUpdated: Date | null;
  refetchStock: () => Promise<void>;
  clearError: () => void;
}

export function useInventory(itemId: string, pollIntervalMs = 5000): UseInventoryReturn {
  const [stock, setStock] = useState<StockResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const stockRef = useRef<StockResponse | null>(null);

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

  // Real-time WebSocket connection to /stock with automatic fallback
  useEffect(() => {
    if (!itemId.trim()) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const cleanHost = baseUrl.replace(/^https?:\/\//, '');

    // Try WebSocket endpoints (/api/v1/inventory/stock or /stock)
    const wsUrl = `${wsProtocol}://${cleanHost}/api/v1/inventory/stock?item_id=${encodeURIComponent(itemId)}`;

    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        if (isMountedRef.current) {
          setIsRealtimeConnected(true);
        }
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // Handle both direct stock objects and wrapped event payloads
          const stockData = payload.data || payload;

          if (stockData && (stockData.item_id === itemId || stockData.available_stock !== undefined)) {
            if (isMountedRef.current) {
              setStock((prev) => ({
                item_id: stockData.item_id || itemId,
                name: stockData.name || prev?.name,
                total_stock: stockData.total_stock ?? prev?.total_stock ?? 0,
                reserved_stock: stockData.reserved_stock ?? prev?.reserved_stock ?? 0,
                available_stock: stockData.available_stock ?? prev?.available_stock ?? 0,
              }));
              setLastUpdated(new Date());
            }
          }
        } catch (e) {
          console.warn('[Realtime Stock] Non-JSON payload received:', event.data);
        }
      };

      socket.onerror = () => {
        if (isMountedRef.current) {
          setIsRealtimeConnected(false);
        }
      };

      socket.onclose = () => {
        if (isMountedRef.current) {
          setIsRealtimeConnected(false);
        }
      };
    } catch {
      setIsRealtimeConnected(false);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [itemId]);

  // Initial fetch and background polling interval fallback
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
    isRealtimeConnected,
    error,
    lastUpdated,
    refetchStock,
    clearError,
  };
}
