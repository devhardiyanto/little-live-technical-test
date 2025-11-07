// ============================================
// Enums
// ============================================

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  E_WALLET = 'e_wallet'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// ============================================
// Invoice Types
// ============================================

export interface InvoiceItem {
  id: string
  invoiceId?: string
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number      // quantity × unitPrice
  taxRate: number        // e.g., 0.07 for 7% GST
  taxAmount: number      // lineTotal × taxRate
  createdAt?: Date
  updatedAt?: Date
}

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: Date
  dueDate?: Date
  customerId?: string
  customerName?: string
  customerEmail?: string
  items: InvoiceItem[]
  subtotal: number           // Sum of all lineTotal
  totalTax: number           // Sum of all taxAmount
  totalAmount: number        // subtotal + totalTax
  outstandingAmount: number  // totalAmount - total paid
  status: InvoiceStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Payment Types
// ============================================

export interface Payment {
  id: string
  invoiceId: string
  paymentMethod: PaymentMethod
  amount: number
  paymentDate: Date
  referenceNumber: string
  status: PaymentStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Receipt Types
// ============================================

export interface ReceiptItem {
  id: string
  receiptId?: string
  invoiceItemId: string
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  taxAmount: number
  paidAmount: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Receipt {
  id: string
  paymentId: string
  invoiceId: string
  receiptNumber: string
  receiptDate: Date
  totalPaid: number
  remainingBalance: number
  items: ReceiptItem[]
  paymentMethod: PaymentMethod
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Helper Types for Business Logic
// ============================================

export interface InvoiceTotals {
  subtotal: number
  totalTax: number
  totalAmount: number
}

export interface PaymentResult {
  payment: Payment
  invoice: Invoice
  receipt: Receipt
  isFullyPaid: boolean
  isOverpayment: boolean
  overpaymentAmount: number
}

export interface CreateInvoiceItemInput {
  description: string
  quantity: number
  unitPrice: number
  taxRate?: number  // Optional, default 0.07 (7% GST)
}

export interface CreateInvoiceInput {
  invoiceNumber?: string  // Auto-generate if not provided
  invoiceDate?: Date      // Default to now
  dueDate?: Date
  customerId?: string
  customerName?: string
  customerEmail?: string
  items: CreateInvoiceItemInput[]
  notes?: string
}

export interface CreatePaymentInput {
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string  // Auto-generate if not provided
  paymentDate?: Date        // Default to now
  notes?: string
}

export interface UpdateInvoiceInput {
  invoiceNumber?: string
  dueDate?: Date
  customerName?: string
  customerEmail?: string
  status?: InvoiceStatus
  notes?: string
}
