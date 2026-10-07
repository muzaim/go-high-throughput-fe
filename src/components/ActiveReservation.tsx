import React, { useState } from 'react';
import { ReserveResponse, ConfirmResponse } from '../types/inventory';
import { inventoryApi } from '../services/inventoryApi';
import { ApiError } from '../services/api';
import { useCountdown } from '../hooks/useCountdown';
import { AlertMessage } from './AlertMessage';

interface ActiveReservationProps {
  reservation: ReserveResponse;
  onConfirmSuccess: (response: ConfirmResponse) => void;
  onExpire: () => void;
  onClear: () => void;
  confirmedData?: ConfirmResponse | null;
}

export const ActiveReservation: React.FC<ActiveReservationProps> = ({
  reservation,
  onConfirmSuccess,
  onExpire,
  onClear,
  confirmedData,
}) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const isConfirmed = Boolean(confirmedData);

  const { formattedTime, isExpired } = useCountdown({
    expiresAt: reservation.expires_at,
    onExpire,
    isConfirmed,
  });

  const handleConfirm = async () => {
    if (isExpired || isConfirming || isConfirmed) return;

    setIsConfirming(true);
    setError(null);

    try {
      const response = await inventoryApi.confirmReservation({
        reservation_id: reservation.reservation_id,
      });
      onConfirmSuccess(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError('Failed to confirm reservation.', 'CONFIRMATION_FAILED', 500)
        );
      }
    } finally {
      setIsConfirming(false);
    }
  };

  if (isConfirmed && confirmedData) {
    return (
      <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            <h2 className="text-base font-bold text-emerald-900">Purchase Confirmed</h2>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline"
          >
            Create New Reservation
          </button>
        </div>

        <div className="bg-white border border-emerald-200 rounded-md p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Reservation ID</span>
            <span className="font-mono font-semibold text-gray-800 break-all">
              {confirmedData.reservation_id}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Item</span>
            <span className="font-mono font-semibold text-gray-800">
              {reservation.item_id} (Qty: {reservation.quantity})
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Confirmed At</span>
            <span className="font-mono font-semibold text-gray-800">
              {new Date(confirmedData.confirmed_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`rounded-lg border p-5 shadow-sm space-y-4 transition-colors ${
        isExpired
          ? 'bg-red-50/50 border-red-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isExpired ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
            }`}
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-gray-900">
            {isExpired ? 'Expired Reservation' : 'Active Reservation'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Expires in:</span>
          <span
            className={`font-mono font-bold text-lg px-2.5 py-0.5 rounded border ${
              isExpired
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {isExpired ? 'EXPIRED' : formattedTime}
          </span>
        </div>
      </div>

      {isExpired && (
        <AlertMessage
          type="error"
          title="Reservation Expired"
          message="This reservation has expired. Stock has been returned to the available inventory pool."
        />
      )}

      {error && <AlertMessage error={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-3.5 rounded border border-gray-200 text-sm">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Reservation ID
          </span>
          <span className="font-mono font-bold text-gray-900 break-all">
            {reservation.reservation_id}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Item ID
          </span>
          <span className="font-mono font-bold text-gray-900">{reservation.item_id}</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Reserved Quantity
          </span>
          <span className="font-mono font-bold text-gray-900">{reservation.quantity}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium underline"
        >
          Dismiss
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isExpired || isConfirming}
          className={`px-5 py-2.5 text-sm font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
            isExpired
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500'
          }`}
        >
          {isConfirming ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Confirming Purchase...
            </>
          ) : (
            'Confirm Purchase'
          )}
        </button>
      </div>
    </section>
  );
};
