import type { Product } from "../types/product";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(price: string): string {
  return `₹${parseFloat(price).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">
          {product.name}
        </h3>
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {product.category}
        </span>
      </div>

      <p className="mb-3 text-lg font-bold text-gray-900">
        {formatPrice(product.price)}
      </p>

      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Created</span>
          <span>{formatDate(product.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Updated</span>
          <span>{formatDate(product.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}
