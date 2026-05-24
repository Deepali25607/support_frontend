import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { products as FALLBACK_PRODUCTS } from '../data/products.js';

const Ctx = createContext({
  products: FALLBACK_PRODUCTS,
  categories: ['All'],
  loading: true,
  refresh: () => {},
});

const sortBy = (arr) => [...arr].sort((a, b) => {
  const ao = a.order ?? 999;
  const bo = b.order ?? 999;
  if (ao !== bo) return ao - bo;
  return (a.name || '').localeCompare(b.name || '');
});

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { data } = await api.get('/api/products');
      if (Array.isArray(data) && data.length) setProducts(sortBy(data));
    } catch {
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  return <Ctx.Provider value={{ products, categories, loading, refresh }}>{children}</Ctx.Provider>;
}

export function useProducts() {
  return useContext(Ctx);
}
