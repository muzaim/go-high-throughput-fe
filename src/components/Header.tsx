import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-3.5 h-3.5 rounded-full bg-brand-primary inline-block group-hover:scale-110 transition-transform" aria-hidden="true" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 group-hover:text-brand-primary transition-colors">
              Surya Store
            </h1>
            <p className="text-xs text-gray-500">
              Flash Sale Inventory Reservation
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};
