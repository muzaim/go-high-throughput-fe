import React from 'react';
import { ApiError } from '../services/api';

interface AlertMessageProps {
  error?: ApiError | string | null;
  type?: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message?: string;
  onDismiss?: () => void;
}

const ERROR_MAP: Record<string, string> = {
  INSUFFICIENT_STOCK: 'Unable to reserve stock. There is not enough inventory available.',
  INVALID_INPUT: 'Please check the entered information.',
  INVALID_QUANTITY: 'Please specify a valid quantity greater than 0.',
  RESERVATION_NOT_FOUND: 'Reservation could not be found.',
  RESERVATION_EXPIRED: 'This reservation has expired. Please create a new reservation.',
  ITEM_NOT_FOUND: 'The specified item was not found.',
  MISSING_ITEM_ID: 'Please specify an item ID.',
  NETWORK_ERROR: 'Unable to connect to the backend API. Please check server availability.',
};

export const AlertMessage: React.FC<AlertMessageProps> = ({
  error,
  type = 'error',
  title,
  message,
  onDismiss,
}) => {
  if (!error && !message) return null;

  let displayTitle = title;
  let displayMessage = message || '';

  if (error) {
    if (typeof error === 'string') {
      displayMessage = error;
    } else if (error instanceof ApiError) {
      if (ERROR_MAP[error.code]) {
        displayMessage = ERROR_MAP[error.code];
      } else {
        displayMessage = error.message || 'An unexpected error occurred.';
      }

      if (!displayTitle) {
        displayTitle = error.code ? `Error (${error.code})` : 'Operation Failed';
      }
    }
  }

  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      badge: 'bg-red-100 text-red-700',
      icon: '⚠',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      badge: 'bg-amber-100 text-amber-700',
      icon: '⚡',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700',
      icon: '✓',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      badge: 'bg-blue-100 text-blue-700',
      icon: 'ℹ',
    },
  }[type];

  return (
    <div
      role="alert"
      className={`p-4 rounded-md border text-sm flex items-start justify-between gap-3 ${styles.bg} transition-all`}
    >
      <div className="flex gap-2.5 items-start">
        <span className="font-bold text-base leading-none select-none mt-0.5" aria-hidden="true">
          {styles.icon}
        </span>
        <div>
          {displayTitle && <h4 className="font-semibold mb-0.5">{displayTitle}</h4>}
          <p className="text-sm leading-relaxed">{displayMessage}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 font-bold px-1.5 py-0.5 rounded text-xs border border-transparent hover:border-gray-300"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};
