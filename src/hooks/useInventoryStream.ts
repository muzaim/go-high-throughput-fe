import { useState, useEffect, useRef } from 'react';
import { SseStatus, SseInventoryEventPayload } from '../types/inventory';

interface UseInventoryStreamOptions {
  itemId: string;
  onInventoryUpdated: () => void;
  enabled?: boolean;
}

interface UseInventoryStreamReturn {
  status: SseStatus;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useInventoryStream({
  itemId,
  onInventoryUpdated,
  enabled = true,
}: UseInventoryStreamOptions): UseInventoryStreamReturn {
  const [status, setStatus] = useState<SseStatus>('disconnected');
  const onInventoryUpdatedRef = useRef(onInventoryUpdated);

  // Keep callback ref updated without triggering effect re-subscriptions
  useEffect(() => {
    onInventoryUpdatedRef.current = onInventoryUpdated;
  }, [onInventoryUpdated]);

  useEffect(() => {
    if (!enabled || !itemId.trim()) {
      setStatus('disconnected');
      return;
    }

    const streamUrl = `${BASE_URL}/api/v1/inventory/stream?item_id=${encodeURIComponent(itemId.trim())}`;
    let eventSource: EventSource | null = null;

    setStatus('connecting');

    try {
      eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        setStatus('connected');
      };

      // Listen specifically for the named event: inventory_updated
      eventSource.addEventListener('inventory_updated', (event: MessageEvent) => {
        try {
          if (event.data) {
            const payload: SseInventoryEventPayload = JSON.parse(event.data);
            // Verify event item_id matches the currently displayed item
            if (payload && payload.item_id === itemId.trim()) {
              if (onInventoryUpdatedRef.current) {
                onInventoryUpdatedRef.current();
              }
            }
          } else {
            // Trigger refresh if no payload is present
            if (onInventoryUpdatedRef.current) {
              onInventoryUpdatedRef.current();
            }
          }
        } catch (e) {
          console.warn('[SSE Stream] Non-JSON payload received in inventory_updated event:', event.data, e);
          // Still trigger refresh as fallback on event arrival
          if (onInventoryUpdatedRef.current) {
            onInventoryUpdatedRef.current();
          }
        }
      });

      eventSource.onerror = () => {
        // Native EventSource automatically attempts to reconnect on error
        setStatus('disconnected');
      };
    } catch (e) {
      console.error('[SSE Stream] Failed to initialize EventSource:', e);
      setStatus('disconnected');
    }

    // Cleanup connection when component unmounts or itemId changes
    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      setStatus('disconnected');
    };
  }, [itemId, enabled]);

  return { status };
}
