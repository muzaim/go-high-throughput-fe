import { fetchApi } from './api';
import {
  StockResponse,
  ItemListResponse,
  ReserveRequest,
  ReserveResponse,
  ConfirmRequest,
  ConfirmResponse,
} from '../types/inventory';

export const inventoryApi = {
  /**
   * Fetch list of all available items with stock details.
   */
  async getAllItems(): Promise<ItemListResponse> {
    return fetchApi<ItemListResponse>('/api/v1/inventory/items', {
      method: 'GET',
    });
  },

  /**
   * Fetch current inventory stock for a given item ID.
   */
  async getStock(itemId: string): Promise<StockResponse> {
    return fetchApi<StockResponse>(`/api/v1/inventory/stock?item_id=${encodeURIComponent(itemId)}`, {
      method: 'GET',
    });
  },

  /**
   * Reserve inventory stock for a user.
   */
  async reserveStock(data: ReserveRequest): Promise<ReserveResponse> {
    return fetchApi<ReserveResponse>('/api/v1/inventory/reserve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Confirm an existing active reservation.
   */
  async confirmReservation(data: ConfirmRequest): Promise<ConfirmResponse> {
    return fetchApi<ConfirmResponse>('/api/v1/inventory/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
