-- Restaurant Management System Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('delivery', 'pickup');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'cash');
CREATE TYPE menu_category AS ENUM ('appetizers', 'main_courses', 'desserts', 'beverages', 'salads', 'soups', 'sides', 'specials');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow INSERT during signup (important!)
CREATE POLICY "Allow insert during signup" 
ON public.profiles FOR INSERT 
WITH CHECK (true); -- Allow anyone to insert initially

-- Admins can do everything (optional)
CREATE POLICY "Admins have full access" 
ON public.profiles FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Menu Items table
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_de TEXT NOT NULL,
    description TEXT NOT NULL,
    description_de TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    category menu_category NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    spice_level INTEGER DEFAULT 0 CHECK (spice_level >= 0 AND spice_level <= 3),
    preparation_time INTEGER DEFAULT 15 CHECK (preparation_time > 0),
    calories INTEGER,
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL UNIQUE,
    status order_status DEFAULT 'pending',
    order_type order_type NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    tip DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    special_instructions TEXT,
    estimated_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table (for mock payment system)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status payment_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    card_last_four TEXT,
    card_brand TEXT,
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory table
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL UNIQUE REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    last_restocked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carts table (for guest and logged-in users)
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(session_id)
);

-- Cart Items table
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_is_available ON public.menu_items(is_available);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- Menu items policies (public read, admin write)
CREATE POLICY "Anyone can view available menu items" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu items" ON public.menu_items
    FOR ALL USING (public.is_admin());

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

CREATE POLICY "Users can create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (public.is_admin());

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

CREATE POLICY "Users can create payments" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (public.is_admin());

-- Inventory policies (admin only)
CREATE POLICY "Admins can manage inventory" ON public.inventory
    FOR ALL USING (public.is_admin());

-- Cart policies
CREATE POLICY "Users can manage own cart" ON public.carts
    FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Cart items accessible via cart" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.user_id IS NULL)
        )
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for orders (for order tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Insert sample menu items
INSERT INTO public.menu_items (name, name_de, description, description_de, price, category, is_vegetarian, is_vegan, is_gluten_free, spice_level, preparation_time, calories, allergens, image_url) VALUES
('Classic Margherita Pizza', 'Klassische Margherita Pizza', 'Fresh tomato sauce, mozzarella cheese, and basil on a crispy crust', 'Frische Tomatensauce, Mozzarella und Basilikum auf knusprigem Teig', 12.99, 'main_courses', true, false, false, 0, 20, 850, ARRAY['gluten', 'dairy'], 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400'),
('Grilled Salmon', 'Gegrillter Lachs', 'Atlantic salmon with lemon butter sauce, served with seasonal vegetables', 'Atlantischer Lachs mit Zitronen-Butter-Sauce, serviert mit saisonalem Gemüse', 24.99, 'main_courses', false, false, true, 0, 25, 650, ARRAY['fish'], 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'),
('Caesar Salad', 'Caesar Salat', 'Crisp romaine lettuce, parmesan, croutons, and our house-made Caesar dressing', 'Knackiger Römersalat, Parmesan, Croutons und hausgemachtes Caesar-Dressing', 11.99, 'salads', false, false, false, 0, 10, 450, ARRAY['gluten', 'dairy', 'eggs'], 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'),
('Spicy Thai Curry', 'Scharfes Thai Curry', 'Coconut milk curry with vegetables and your choice of protein', 'Kokosmilch-Curry mit Gemüse und Ihrer Wahl an Protein', 16.99, 'main_courses', true, true, true, 3, 20, 580, ARRAY['coconut'], 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400'),
('Chocolate Lava Cake', 'Schokoladen-Lavakuchen', 'Warm chocolate cake with a molten center, served with vanilla ice cream', 'Warmer Schokoladenkuchen mit flüssigem Kern, serviert mit Vanilleeis', 8.99, 'desserts', true, false, false, 0, 15, 680, ARRAY['gluten', 'dairy', 'eggs'], 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400'),
('Garlic Bread', 'Knoblauchbrot', 'Freshly baked bread with garlic butter and herbs', 'Frisch gebackenes Brot mit Knoblauchbutter und Kräutern', 5.99, 'appetizers', true, false, false, 0, 8, 320, ARRAY['gluten', 'dairy'], 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400'),
('Tomato Soup', 'Tomatensuppe', 'Creamy tomato soup with fresh basil and a drizzle of olive oil', 'Cremige Tomatensuppe mit frischem Basilikum und einem Schuss Olivenöl', 7.99, 'soups', true, true, true, 0, 10, 220, ARRAY[]::text[], 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400'),
('Craft Lemonade', 'Hausgemachte Limonade', 'Fresh-squeezed lemons with a hint of mint and honey', 'Frisch gepresste Zitronen mit einem Hauch Minze und Honig', 4.99, 'beverages', true, true, true, 0, 5, 120, ARRAY[]::text[], 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400'),
('Truffle Fries', 'Trüffel-Pommes', 'Crispy fries tossed with truffle oil and parmesan', 'Knusprige Pommes mit Trüffelöl und Parmesan', 9.99, 'sides', true, false, true, 0, 12, 480, ARRAY['dairy'], 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
('Beef Burger', 'Rindfleisch-Burger', 'Angus beef patty with cheese, lettuce, tomato, and special sauce', 'Angus-Rindfleisch-Patty mit Käse, Salat, Tomate und Spezialsauce', 15.99, 'main_courses', false, false, false, 1, 18, 920, ARRAY['gluten', 'dairy', 'eggs'], 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
('Veggie Bowl', 'Veggie Bowl', 'Quinoa, roasted vegetables, avocado, and tahini dressing', 'Quinoa, geröstetes Gemüse, Avocado und Tahini-Dressing', 14.99, 'main_courses', true, true, true, 0, 15, 520, ARRAY['sesame'], 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'),
('Tiramisu', 'Tiramisu', 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone', 'Klassisches italienisches Dessert mit kaffegetränkten Löffelbiskuits und Mascarpone', 7.99, 'desserts', true, false, false, 0, 5, 450, ARRAY['gluten', 'dairy', 'eggs'], 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400');


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();