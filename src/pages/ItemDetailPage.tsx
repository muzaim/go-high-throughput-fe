import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInventory } from '../hooks/useInventory';
import { ReservationForm } from '../components/ReservationForm';
import { ActiveReservation } from '../components/ActiveReservation';
import { AlertMessage } from '../components/AlertMessage';
import { getItemImageUrl } from '../utils/itemImages';
import { ReserveResponse, ConfirmResponse } from '../types/inventory';

export const ItemDetailPage: React.FC = () => {
  const { itemId = 'item_4021' } = useParams<{ itemId: string }>();

  const [activeReservation, setActiveReservation] = useState<ReserveResponse | null>(null);
  const [confirmedData, setConfirmedData] = useState<ConfirmResponse | null>(null);

  const {
    stock,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refetchStock,
  } = useInventory(itemId, 8000);

  const handleReservationSuccess = useCallback((reservation: ReserveResponse) => {
    setActiveReservation(reservation);
    setConfirmedData(null);
  }, []);

  const handleConfirmSuccess = useCallback(
    (confirmation: ConfirmResponse) => {
      setConfirmedData(confirmation);
      refetchStock();
    },
    [refetchStock]
  );

  const handleExpire = useCallback(() => {
    refetchStock();
  }, [refetchStock]);

  const handleClearReservation = useCallback(() => {
    setActiveReservation(null);
    setConfirmedData(null);
  }, []);

  const imageUrl = getItemImageUrl(itemId, stock?.name);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-primary transition-colors py-1.5 px-3 bg-white border border-gray-200 rounded-md shadow-sm"
        >
          ← Back to Catalog
        </Link>
      </div>

      {error && <AlertMessage error={error} />}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Image */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-3">
          <div className="relative aspect-square w-full rounded-md overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={stock?.name || 'Product Details'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Column: Top Stock Info Card + Bottom Reservation Form Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Kanan Atas: Informasi Stock, Reserved, Available + Icon Refresh & Timestamp */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {stock?.name || 'Product Details'}
              </h1>

              <div className="flex items-center gap-2">
                {lastUpdated && (
                  <span className="text-[11px] font-mono text-gray-400" title="Last updated time">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => refetchStock()}
                  disabled={isLoading || isRefreshing}
                  title="Refresh stock"
                  className="p-1.5 border border-gray-200 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  aria-label="Refresh stock"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-primary' : ''}`}
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
            </div>

            {/* Compact Stock Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">
                  {stock ? stock.total_stock : '—'}
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-md p-3 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Reserved
                </span>
                <span className="text-xl font-bold font-mono text-amber-900 mt-0.5 block">
                  {stock ? stock.reserved_stock : '—'}
                </span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-md p-3 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Available
                </span>
                <span className="text-xl font-bold font-mono text-emerald-900 mt-0.5 block">
                  {stock ? stock.available_stock : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Reservation Section (if active or confirmed) */}
          {(activeReservation || confirmedData) && (
            <ActiveReservation
              reservation={activeReservation!}
              confirmedData={confirmedData}
              onConfirmSuccess={handleConfirmSuccess}
              onExpire={handleExpire}
              onClear={handleClearReservation}
            />
          )}

          {/* Card Kanan Bawah: Process Submit Form */}
          <ReservationForm
            currentItemId={itemId}
            onReservationSuccess={handleReservationSuccess}
            onInventoryChange={refetchStock}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
