export interface StockResponse {
  item_id: string;
  name?: string;
  total_stock: number;
  reserved_stock: number;
  available_stock: number;
}

export interface ItemListResponse {
  status: string;
  items: StockResponse[];
}

export interface ReserveRequest {
  user_id: string;
  item_id: string;
  quantity: number;
}

export interface ReserveResponse {
  status: string;
  reservation_id: string;
  item_id: string;
  quantity: number;
  expires_at: string;
}

export interface ConfirmRequest {
  reservation_id: string;
}

export interface ConfirmResponse {
  status: string;
  reservation_id: string;
  confirmed_at: string;
}

export interface APIErrorResponse {
  status: string;
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

export type ReservationStatus = 'active' | 'expired' | 'confirmed';

export type SseStatus = 'connecting' | 'connected' | 'disconnected';

export interface SseInventoryEventPayload {
  item_id: string;
}
