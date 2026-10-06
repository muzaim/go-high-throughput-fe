import React from 'react';
import { StockResponse } from '../types/inventory';
import { getItemImageUrl } from '../utils/itemImages';

interface ItemDetailHeaderProps {
  item: StockResponse | null;
  itemId: string;
  onBackToCatalog: () => void;
}

export const ItemDetailHeader: React.FC<ItemDetailHeaderProps> = ({
  item,
  itemId,
  onBackToCatalog,
}) => {
  const imageUrl = getItemImageUrl(itemId, item?.name);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-primary transition-colors py-1 px-2.5 bg-gray-100 hover:bg-gray-200 rounded"
        >
          ← Back to Catalog
        </button>

        <span className="text-xs font-mono font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
          ID: {itemId}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <img
          src={imageUrl}
          alt={item?.name || itemId}
          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md border border-gray-200 shadow-sm flex-shrink-0"
        />

        <div className="space-y-1.5 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {item?.name || `Item ${itemId}`}
          </h2>
          <p className="text-xs text-gray-500">
            Real-time flash sale stock status & reservation allocation
          </p>

          {item && (
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {item.available_stock} Available
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200">
                {item.reserved_stock} Reserved
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
