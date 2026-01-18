// Database types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  name_de: string;
  description: string;
  description_de: string;
  price: number;
  category: MenuCategory;
  image_url: string | null;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: 0 | 1 | 2 | 3;
  preparation_time: number; // in minutes
  calories: number | null;
  allergens: string[];
  created_at: string;
  updated_at: string;
}

export type MenuCategory =
  | 'appetizers'
  | 'main_courses'
  | 'desserts'
  | 'beverages'
  | 'salads'
  | 'soups'
  | 'sides'
  | 'specials';

export interface CartItem {
  id: string;
  menu_item_id: string;
  menu_item: MenuItem;
  quantity: number;
  special_instructions: string | null;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  order_type: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  tip: number;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string | null;
  special_instructions: string | null;
  estimated_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item: MenuItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: 'EUR' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'card' | 'cash';
  card_last_four: string | null;
  card_brand: string | null;
  transaction_id: string | null;
  created_at: string;
}

export interface Inventory {
  id: string;
  menu_item_id: string;
  quantity: number;
  low_stock_threshold: number;
  last_restocked: string | null;
  created_at: string;
  updated_at: string;
}

// Form types
export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string;
  specialInstructions?: string;
  tip: number;
}

export interface PaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// Analytics types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopMenuItem {
  menuItem: MenuItem;
  totalOrdered: number;
  revenue: number;
}

// Filter types
export interface MenuFilters {
  category: MenuCategory | 'all';
  search: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  maxPrice: number | null;
  spiceLevel: number | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Theme and i18n types
export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'de';
