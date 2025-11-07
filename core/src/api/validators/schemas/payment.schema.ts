import { z } from 'zod'

// Create Payment Schema
export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  amount: z.number().positive('Payment amount must be positive').max(999999999.99, 'Amount too large'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'e_wallet'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  referenceNumber: z.string().optional(),
  paymentDate: z.string().datetime().optional().or(z.date().optional()),
  notes: z.string().optional()
})

// Query Filters Schema
export const paymentFiltersSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'cancelled', 'refunded']).optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'e_wallet']).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional()
})

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>
export type PaymentFiltersSchema = z.infer<typeof paymentFiltersSchema>
