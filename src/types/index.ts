export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'approved' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  lat?: number;
  lng?: number;
  payment_method: 'pix' | 'card' | 'cash';
  change_needed: number;
  status: OrderStatus;
  total_price: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}
