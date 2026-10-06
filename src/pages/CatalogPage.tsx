import React from 'react';
import { ProductCatalog } from '../components/ProductCatalog';
import { useItemList } from '../hooks/useItemList';

export const CatalogPage: React.FC = () => {
  const { items, isLoading, isRefreshing, error, refetchItems } = useItemList(8000);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <ProductCatalog
        items={items}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refetchItems}
      />
    </div>
  );
};

export default CatalogPage;
