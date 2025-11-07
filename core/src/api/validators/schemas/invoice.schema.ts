import { z } from 'zod'

// Invoice Item Schema
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  taxRate: z.number().min(0).max(1).optional().default(0.07) // 7% GST
})

// Create Invoice Schema
export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().datetime().optional().or(z.date().optional()),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  customerId: z.string().optional(),
  customerName: z.string().max(255).optional(),
  customerEmail: z.string().email().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional()
})

// Update Invoice Schema
export const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  customerName: z.string().max(255).optional(),
  customerEmail: z.string().email().optional(),
  status: z.enum(['draft', 'pending', 'partially_paid', 'paid', 'cancelled', 'overdue']).optional(),
  notes: z.string().optional()
})

// Query Filters Schema
export const invoiceFiltersSchema = z.object({
  status: z.enum(['draft', 'pending', 'partially_paid', 'paid', 'cancelled', 'overdue']).optional(),
  customerId: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional()
})

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>
export type InvoiceFiltersSchema = z.infer<typeof invoiceFiltersSchema>
