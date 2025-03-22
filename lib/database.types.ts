export type User = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};

export type Order = {
  orderId: number;
  userId: number;
  productIds: number[];
  orderDate: Date;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
};

export type ApiResponse<T> = {
  data: T;
  error: string | null;
  status: number;
};

export type MoodboardItem = {
  id: string;
  type: 'image' | 'text';
  content?: string;
  src?: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  zIndex: number;
  style: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
};

export type Moodboard = {
  id: string;
  title: string;
  background_color: string;
  items: MoodboardItem[];
};

// For Supabase typing, we need to define the Database interface
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id'>;
        Update: Partial<User>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id'>;
        Update: Partial<Product>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'orderId'>;
        Update: Partial<Order>;
      };
      moodboards: {
        Row: Moodboard;
        Insert: Omit<Moodboard, 'id'>;
        Update: Partial<Moodboard>;
      };
    };
  };
};

export type UserResponse = ApiResponse<User>;
export type ProductResponse = ApiResponse<Product>;
export type OrderResponse = ApiResponse<Order>;

