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

    const targetItemId = itemId.trim();
    const streamUrl = `${BASE_URL}/api/v1/inventory/stream?item_id=${encodeURIComponent(targetItemId)}`;
    let eventSource: EventSource | null = null;

    setStatus('connecting');

    const handleSseEvent = (event: MessageEvent) => {
      try {
        let eventItemId: string | null = null;

        if (event.data) {
          try {
            const payload: SseInventoryEventPayload | string = JSON.parse(event.data);
            if (typeof payload === 'object' && payload !== null && 'item_id' in payload) {
              eventItemId = payload.item_id;
            } else if (typeof payload === 'string') {
              eventItemId = payload;
            }
          } catch {
            // Data string might be raw item_id
            eventItemId = event.data;
          }
        }

        // Trigger refetch if item_id matches or if no item_id constraint was provided
        if (!eventItemId || eventItemId === targetItemId) {
          if (onInventoryUpdatedRef.current) {
            onInventoryUpdatedRef.current();
          }
        }
      } catch (e) {
        console.warn('[SSE Stream] Error processing event:', e);
        if (onInventoryUpdatedRef.current) {
          onInventoryUpdatedRef.current();
        }
      }
    };

    try {
      eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        setStatus('connected');
      };

      // Listen specifically for the named event: inventory_updated
      eventSource.addEventListener('inventory_updated', handleSseEvent);

      // Also listen for generic message events as a fallback
      eventSource.onmessage = handleSseEvent;

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
        eventSource.removeEventListener('inventory_updated', handleSseEvent);
        eventSource.close();
        eventSource = null;
      }
      setStatus('disconnected');
    };
  }, [itemId, enabled]);

  return { status };
}
