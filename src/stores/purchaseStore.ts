import { create } from 'zustand'
import type { InitiatePurchasePayload } from '../types/website'

interface PurchaseState {
  step: 1 | 2 | 3
  formData: Partial<InitiatePurchasePayload>
  orderId: string | null
  paymentReference: string | null
  setStep: (step: 1 | 2 | 3) => void
  setFormData: (data: Partial<InitiatePurchasePayload>) => void
  setOrderId: (id: string) => void
  setPaymentReference: (ref: string) => void
  reset: () => void
}

/** 
 * Public website state management for the multi-step voucher purchase flow.
 */
export const usePurchaseStore = create<PurchaseState>((set) => ({
  step: 1,
  formData: {},
  orderId: null,
  paymentReference: null,
  setStep: (step) => set({ step }),
  setFormData: (data) => set((s) => ({ formData: { ...s.formData, ...data } })),
  setOrderId: (orderId) => set({ orderId }),
  setPaymentReference: (paymentReference) => set({ paymentReference }),
  reset: () => set({ step: 1, formData: {}, orderId: null, paymentReference: null }),
}))
