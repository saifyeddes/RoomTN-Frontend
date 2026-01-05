/*
  # Schema initial pour Room.tn

  1. Nouvelles Tables
    - `users` - Profils utilisateurs étendus
      - `id` (uuid, clé primaire, référence auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (enum: customer, admin, super_admin)
      - `created_at` (timestamp)

    - `categories` - Catégories de produits
      - `id` (uuid, clé primaire)
      - `name` (text, unique)
      - `image_url` (text)
      - `created_at` (timestamp)

    - `products` - Produits du catalogue
      - `id` (uuid, clé primaire)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category_id` (uuid, référence categories)
      - `images` (json array)
      - `sizes` (json array)
      - `colors` (json array)
      - `gender` (enum: homme, femme, unisexe)
      - `stock` (integer)
      - `is_featured` (boolean)
      - `created_at` (timestamp)

    - `orders` - Commandes client
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence users)
      - `total_amount` (decimal)
      - `status` (enum: pending, confirmed, shipped, delivered, cancelled)
      - `shipping_address` (text)
      - `phone` (text)
      - `created_at` (timestamp)

    - `order_items` - Articles dans les commandes
      - `id` (uuid, clé primaire)
      - `order_id` (uuid, référence orders)
      - `product_id` (uuid, référence products)
      - `size` (text)
      - `color` (text)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamp)

  2. Sécurité
    - Activation de RLS sur toutes les tables
    - Politiques pour les utilisateurs authentifiés
    - Politiques spéciales pour les administrateurs
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin');
CREATE TYPE gender_type AS ENUM ('homme', 'femme', 'unisexe');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,3) NOT NULL CHECK (price >= 0),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images json DEFAULT '[]',
  sizes json DEFAULT '[]',
  colors json DEFAULT '[]',
  gender gender_type NOT NULL,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount decimal(10,3) NOT NULL CHECK (total_amount >= 0),
  status order_status DEFAULT 'pending',
  shipping_address text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  color text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,3) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for products (public read, admin write)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);