export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin' | 'super_admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: Category;
  images: string[];
  sizes: string[];
  colors: string[];
  rating: 4 | 4.5 | 5;
  stock_quantity: number;
  is_featured: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  user?: User;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  phone: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export type Review = {
  id: string;
  user_id: string;
  user: User;
  product_id: string;
  product: Product;
  rating: number;
  comment: string;
  created_at: string;
};

export interface Filter {
  id: string;
  name: string;
  options: {
    value: string;
    label: string;
    checked: boolean;
  }[];
}