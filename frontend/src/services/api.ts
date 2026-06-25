import axios from "axios";
import type { ProductsResponse } from "../types/product";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

interface FetchProductsParams {
  limit?: number;
  cursor?: string | null;
  category?: string | null;
  snapshot?: string | null;
}

export async function fetchProducts({
  limit = 20,
  cursor = null,
  category = null,
  snapshot = null,
}: FetchProductsParams): Promise<ProductsResponse> {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  if (category) params.category = category;
  if (snapshot) params.snapshot = snapshot;

  const { data } = await api.get<ProductsResponse>("/products", { params });
  return data;
}
