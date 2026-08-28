export interface Product {
  id: string;
  name: string;
  price: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  client_id?: string;
  total_amount: number;
  payment_method: 'cash' | 'credit_card' | 'pix' | 'term';
  status: 'pending' | 'paid' | 'cancelled';
  date: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface AccountReceivable {
  id: string;
  sale_id: string;
  client_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface PartialPayment {
  id: string;
  account_receivable_id: string;
  amount: number;
  date: string;
  created_at: string;
}
