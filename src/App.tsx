import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { CatalogPage } from './pages/CatalogPage';
import { ItemDetailPage } from './pages/ItemDetailPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <div>
          <Header />

          <main>
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/items/:itemId" element={<ItemDetailPage />} />
            </Routes>
          </main>
        </div>

        <footer className="border-t border-gray-200 bg-white py-4 px-4 text-center text-xs text-gray-500">
          Flash Sale Inventory Reservation Portal
        </footer>
      </div>
    </Router>
  );
};

export default App;
