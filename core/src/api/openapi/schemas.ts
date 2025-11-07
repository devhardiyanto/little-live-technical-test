import { z } from '@hono/zod-openapi'

// ============================================
// Common Schemas
// ============================================

export const ErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: 'Error message here' })
})

export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Operation successful' }),
    data: dataSchema
  })

// ============================================
// Invoice Schemas
// ============================================

export const InvoiceItemSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  invoiceId: z.string().uuid().optional(),
  description: z.string().openapi({ example: 'Monthly Subscription Fee' }),
  quantity: z.number().openapi({ example: 1 }),
  unitPrice: z.number().openapi({ example: 500.00 }),
  lineTotal: z.number().openapi({ example: 500.00 }),
  taxRate: z.number().openapi({ example: 0.07 }),
  taxAmount: z.number().openapi({ example: 35.00 }),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
})

export const InvoiceSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  invoiceNumber: z.string().openapi({ example: 'INV-20251107-1234' }),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional().openapi({ example: 'John Doe' }),
  customerEmail: z.string().email().optional().openapi({ example: 'john@example.com' }),
  items: z.array(InvoiceItemSchema),
  subtotal: z.number().openapi({ example: 551.00 }),
  totalTax: z.number().openapi({ example: 38.57 }),
  totalAmount: z.number().openapi({ example: 589.57 }),
  outstandingAmount: z.number().openapi({ example: 589.57 }),
  status: z.enum(['draft', 'pending', 'partially_paid', 'paid', 'cancelled', 'overdue']).openapi({ example: 'pending' }),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const CreateInvoiceItemSchema = z.object({
  description: z.string().min(1).max(500).openapi({
    example: 'Monthly Subscription Fee',
    description: 'Description of the item'
  }),
  quantity: z.number().positive().openapi({
    example: 1,
    description: 'Quantity of items'
  }),
  unitPrice: z.number().nonnegative().openapi({
    example: 500.00,
    description: 'Price per unit'
  }),
  taxRate: z.number().min(0).max(1).optional().default(0.07).openapi({
    example: 0.07,
    description: 'Tax rate (default: 0.07 for 7% GST)'
  })
})

export const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  customerId: z.string().optional(),
  customerName: z.string().max(255).optional().openapi({ example: 'John Doe' }),
  customerEmail: z.string().email().optional().openapi({ example: 'john@example.com' }),
  items: z.array(CreateInvoiceItemSchema).min(1),
  notes: z.string().optional()
})

export const UpdateInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  customerName: z.string().max(255).optional(),
  customerEmail: z.string().email().optional(),
  status: z.enum(['draft', 'pending', 'partially_paid', 'paid', 'cancelled', 'overdue']).optional(),
  notes: z.string().optional()
})

// ============================================
// Payment Schemas
// ============================================

export const PaymentSchema = z.object({
  id: z.string().uuid().openapi({ example: 'payment-id-123' }),
  invoiceId: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'e_wallet']).openapi({ example: 'bank_transfer' }),
  amount: z.number().positive().openapi({ example: 300.00 }),
  paymentDate: z.string().datetime(),
  referenceNumber: z.string().openapi({ example: 'PAY-1699357800000-1234' }),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled', 'refunded']).openapi({ example: 'completed' }),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const CreatePaymentSchema = z.object({
  invoiceId: z.string().uuid().openapi({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the invoice to pay'
  }),
  amount: z.number().positive().max(999999999.99).openapi({
    example: 300.00,
    description: 'Payment amount'
  }),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'e_wallet']).openapi({
    example: 'bank_transfer',
    description: 'Payment method'
  }),
  referenceNumber: z.string().optional().openapi({
    description: 'Payment reference number (auto-generated if not provided)'
  }),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional()
})

export const PaymentResultSchema = z.object({
  payment: PaymentSchema,
  invoice: InvoiceSchema,
  receipt: z.any(), // Will be defined below
  isFullyPaid: z.boolean().openapi({ example: false }),
  isOverpayment: z.boolean().openapi({ example: false }),
  overpaymentAmount: z.number().openapi({ example: 0 })
})

// ============================================
// Receipt Schemas
// ============================================

export const ReceiptItemSchema = z.object({
  id: z.string().uuid(),
  receiptId: z.string().uuid().optional(),
  invoiceItemId: z.string().uuid(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
  taxAmount: z.number(),
  paidAmount: z.number(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
})

export const ReceiptSchema = z.object({
  id: z.string().uuid().openapi({ example: 'receipt-id-123' }),
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  receiptNumber: z.string().openapi({ example: 'RCP-1699357800000-1234' }),
  receiptDate: z.string().datetime(),
  totalPaid: z.number().openapi({ example: 300.00 }),
  remainingBalance: z.number().openapi({ example: 289.57 }),
  items: z.array(ReceiptItemSchema),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'e_wallet']),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// ============================================
// Query Parameter Schemas
// ============================================

export const InvoiceQuerySchema = z.object({
  status: z.enum(['draft', 'pending', 'partially_paid', 'paid', 'cancelled', 'overdue']).optional(),
  customerId: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).optional().openapi({ example: '10' }),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional().openapi({ example: '0' })
})

export const PaymentQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'cancelled', 'refunded']).optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'e_wallet']).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional()
})

export const ReceiptQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional()
})

// ============================================
// Statistics Schemas
// ============================================

export const InvoiceStatisticsSchema = z.object({
  total: z.number().openapi({ example: 50 }),
  pending: z.number().openapi({ example: 10 }),
  partiallyPaid: z.number().openapi({ example: 15 }),
  paid: z.number().openapi({ example: 20 }),
  overdue: z.number().openapi({ example: 5 }),
  totalAmount: z.number().openapi({ example: 50000.00 }),
  totalOutstanding: z.number().openapi({ example: 15000.00 })
})

export const PaymentStatisticsSchema = z.object({
  total: z.number().openapi({ example: 125 }),
  totalAmount: z.number().openapi({ example: 125000.00 }),
  completed: z.number().openapi({ example: 120 }),
  pending: z.number().openapi({ example: 3 }),
  failed: z.number().openapi({ example: 2 })
})
