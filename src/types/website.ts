import type { ExamType } from './admin'
export type { ExamType }

export type PaymentMethod =
  | 'MTN_MOMO'
  | 'TELECEL'
  | 'AIRTELTIGO'
  | 'VISA'
  | 'MASTERCARD';

export interface VoucherProduct {
  id: string;
  examType: ExamType;
  priceGHS: number;
  stockCount: number;
  isLowStock: boolean;
  description: string;
}

export interface InitiatePurchasePayload {
  voucherType: ExamType;
  quantity: number;
  phoneNumber: string;
  customerName: string;
  channel: 'WEB' | 'USSD' | string;
}

export interface InitiatePurchaseResponse {
  orderId: string;
  checkoutUrl: string;
  amount: number;
  quantity: number;
  voucherType: string;
}

export interface PurchaseStep {
  step: 1 | 2 | 3;
  label: string;
}
