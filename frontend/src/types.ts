// Hand-written mirrors of the backend's Pydantic models — keep in sync in the same edit.
// Boundary: backend/models/*.py  <->  frontend/src/types.ts (nothing infers across HTTP).

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: "men" | "women" | "kids" | "home";
  subcategory: string;
  price: number;
  original_price: number | null;
  discount_percent: number;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  // Colour name -> photo of the product in that colour (missing colours fall back to images).
  color_images: Record<string, string>;
  rating: number | null;
  rating_count: number | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

// Mirror of backend MessageOut (auth/misc message responses).
export interface MessageOut {
  ok: boolean;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export interface AddressInput {
  label?: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default?: boolean;
}

export interface ShippingAddress {
  label?: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default?: boolean;
}

export interface OrderItem {
  product_id: string;
  name: string;
  sku: string;
  image: string;
  size: string | null;
  color: string | null;
  unit_price: number;
  original_price: number | null;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  subtotal: number;
  discount_total: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  placed_at: string;
  updated_at: string;
}

// Client-side cart line (persisted to localStorage; prices re-resolved from /api/products).
export interface CartLine {
  product_id: string;
  size: string | null;
  color: string | null;
  quantity: number;
}

export interface ProductQuery {
  category?: string;
  subcategory?: string;
  tag?: string;
  q?: string;
  min_price?: number;
  max_price?: number;
  size?: string;
  color?: string;
  in_stock?: boolean;
  on_sale?: boolean;
  ids?: string;
  exclude?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
