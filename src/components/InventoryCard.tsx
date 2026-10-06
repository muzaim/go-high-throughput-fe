import React from 'react';
import { StockResponse } from '../types/inventory';
import { ApiError } from '../services/api';
import { AlertMessage } from './AlertMessage';

interface InventoryCardProps {
  itemId: string;
  setItemId: (id: string) => void;
  debouncedItemId?: string;
  stock: StockResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: ApiError | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  itemId,
  setItemId,
  debouncedItemId,
  stock,
  isLoading,
  isRefreshing,
  error,
  lastUpdated,
  onRefresh,
}) => {
  const isTyping = debouncedItemId !== undefined && itemId !== debouncedItemId;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <label htmlFor="inventory-item-id" className="text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">
            Item ID
          </label>
          <div className="relative flex items-center">
            <input
              id="inventory-item-id"
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-mono font-medium focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-gray-800 bg-gray-50 w-36"
              placeholder="e.g. item_4021"
            />
          </div>
          {isTyping && (
            <span className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 animate-pulse">
              typing...
            </span>
          )}
          {!isTyping && itemId === 'item_4021' && (
            <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
              Demo Item
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && !isTyping && (
            <span className="text-xs text-gray-400 font-mono">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing || isTyping}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 transition-colors"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <AlertMessage error={error} />}

      {(isLoading || isTyping) && !stock ? (
        <div className="grid grid-cols-3 gap-4 py-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded border border-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Total Stock
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 mt-1 block">
              {stock ? stock.total_stock : '—'}
            </span>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-md p-4">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
              Reserved
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 mt-1 block">
              {stock ? stock.reserved_stock : '—'}
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-md p-4">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Available
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900 mt-1 block">
              {stock ? stock.available_stock : '—'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
