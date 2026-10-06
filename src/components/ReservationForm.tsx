import React, { useState } from 'react';
import { ReserveRequest, ReserveResponse } from '../types/inventory';
import { inventoryApi } from '../services/inventoryApi';
import { ApiError } from '../services/api';
import { AlertMessage } from './AlertMessage';

interface ReservationFormProps {
  currentItemId: string;
  onReservationSuccess: (reservation: ReserveResponse) => void;
  onInventoryChange: () => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  currentItemId,
  onReservationSuccess,
  onInventoryChange,
}) => {
  const [userId, setUserId] = useState<string>('usr_9981');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Client-side validations
    if (!userId.trim()) {
      setValidationError('User ID is required.');
      return;
    }

    if (!currentItemId.trim()) {
      setValidationError('Item ID is required.');
      return;
    }

    const parsedQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      setValidationError('Quantity must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    const payload: ReserveRequest = {
      user_id: userId.trim(),
      item_id: currentItemId.trim(),
      quantity: parsedQty,
    };

    try {
      const response = await inventoryApi.reserveStock(payload);
      onReservationSuccess(response);
      onInventoryChange();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError('Failed to reserve stock.', 'RESERVE_FAILED', 500));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Make Reservation</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Submit a temporary stock reservation request
        </p>
      </div>

      {validationError && (
        <AlertMessage type="warning" title="Validation Error" message={validationError} />
      )}

      {error && <AlertMessage error={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user_id" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              User ID <span className="text-brand-primary">*</span>
            </label>
            <input
              id="user_id"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. usr_9981"
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none disabled:bg-gray-100 text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Quantity <span className="text-brand-primary">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setQuantity('');
                } else {
                  const num = parseInt(val, 10);
                  if (!isNaN(num)) {
                    setQuantity(num);
                  }
                }
              }}
              placeholder="1"
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none disabled:bg-gray-100 text-gray-800"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-primary hover:bg-brand-hover active:bg-brand-active text-white text-sm font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Reserving Stock...
              </>
            ) : (
              'Reserve Stock'
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
