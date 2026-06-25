import { useState, useCallback, useEffect } from "react";
import { fetchProducts } from "./services/api";
import type { Product } from "./types/product";
import CategoryFilter from "./components/CategoryFilter";
import ProductGrid from "./components/ProductGrid";
import LoadMoreButton from "./components/LoadMoreButton";
import ErrorDisplay from "./components/ErrorDisplay";
import LoadingSpinner from "./components/LoadingSpinner";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    loadProducts(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProducts = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const nextCursor = reset ? null : cursor;
        const nextSnapshot = reset ? null : snapshot;

        const data = await fetchProducts({
          limit: 20,
          cursor: nextCursor,
          category,
          snapshot: nextSnapshot,
        });

        setProducts((prev) =>
          reset ? data.products : [...prev, ...data.products]
        );
        setCursor(data.nextCursor);
        setSnapshot(data.snapshot);
        setHasMore(data.hasMore);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load products";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [cursor, snapshot, category]
  );

  const handleCategoryChange = (newCategory: string | null) => {
    setCategory(newCategory);
    setProducts([]);
    setCursor(null);
    setSnapshot(null);
    setHasMore(true);
    setError(null);

    // Fetch first page with new category immediately
    setLoading(true);
    fetchProducts({ limit: 20, category: newCategory })
      .then((data) => {
        setProducts(data.products);
        setCursor(data.nextCursor);
        setSnapshot(data.snapshot);
        setHasMore(data.hasMore);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      })
      .finally(() => setLoading(false));
  };

  const handleRefresh = () => {
    setProducts([]);
    setCursor(null);
    setSnapshot(null);
    setHasMore(true);
    loadProducts(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Product Browser</h1>

          <div className="flex items-center gap-3">
            <CategoryFilter value={category} onChange={handleCategoryChange} />

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay
              message={error}
              onRetry={() => loadProducts(products.length === 0)}
            />
          </div>
        )}

        {/* Initial loading */}
        {products.length === 0 && loading && <LoadingSpinner />}

        {/* Product grid */}
        {products.length > 0 && <ProductGrid products={products} />}

        {/* Load more */}
        {products.length > 0 && (
          <LoadMoreButton
            onClick={() => loadProducts(false)}
            loading={loading}
            hasMore={hasMore}
          />
        )}
      </div>
    </div>
  );
}
