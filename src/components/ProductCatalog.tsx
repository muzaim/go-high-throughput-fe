import React from 'react';
import { Link } from 'react-router-dom';
import { StockResponse } from '../types/inventory';
import { ApiError } from '../services/api';
import { getItemImageUrl } from '../utils/itemImages';
import { AlertMessage } from './AlertMessage';

interface ProductCatalogProps {
  items: StockResponse[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: ApiError | null;
  onRefresh: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  items,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Flash Sale Products</h2>
          <p className="text-xs text-gray-500 mt-1">
            Reserve limited stock items before allocation expires.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          title="Refresh catalog stock"
          className="p-2 border border-gray-200 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Refresh catalog"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-primary' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {error && <AlertMessage error={error} />}

      {isLoading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm animate-pulse p-4 space-y-4">
              <div className="w-full aspect-[4/3] bg-gray-200 rounded-md" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-9 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500 text-sm">
          No inventory items available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const imageUrl = getItemImageUrl(item.item_id, item.name);

            return (
              <div
                key={item.item_id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={item.name || item.item_id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                  <h3 className="font-semibold text-gray-900 text-base leading-snug tracking-tight">
                    {item.name || `Item ${item.item_id}`}
                  </h3>

                  <Link
                    to={`/items/${item.item_id}`}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded bg-gray-900 hover:bg-brand-primary text-white text-center shadow-sm transition-colors block"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
