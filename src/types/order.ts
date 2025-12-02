// types/order.ts
export interface Card {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  old_price: string;
  discount: string;
  price: string;
  product_number: string;
  currency: string;
  quantity: number;
  link_video: string;
  image: string;
  gallery: string[];
  category: string;
  active: boolean;
  average_rating: number;
  reviews_count: number;
  free_delevery: boolean;
  one_year_warranty: boolean;
  mobile: string;
  type: string;
  type_silicone: string;
  hardness: string;
  bio: string;
  time_in_ear: string;
  end_curing: string;
  viscosity: string;
  color: string;
  packaging: string;
  item_number: string;
  mix_gun: string;
  mix_canules: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OrderCard {
  id: number;
  card_id: number;
  qty: number;
  card: Card;
}

export interface Order {
  id: number;
  name: string;
  email: string;
  apartment: string | null;
  order_number: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'done';
  zip_code: string;
  payment_method: string;
  payment_status: string;
  promo_code: string | null;
  payment_type: 'cash' | 'installment';
  installment_months: number | null;
  increase_rate: string | null;
  total_amount: string;
  cards: OrderCard[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OrdersResponse {
  data: Order[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  result: string;
  message: string;
  status: number;
}

export interface OrderStatusUpdate {
  status: 'pending' | 'confirmed' | 'cancelled' | 'done';
}