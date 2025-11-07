// Payment System Types for Frontend

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  customerId?: string
  customerName?: string
  customerEmail?: string
  subtotal: number
  totalTax: number
  totalAmount: number
  outstandingAmount: number
  status: 'draft' | 'pending' | 'partially_paid' | 'paid' | 'cancelled' | 'overdue'
  items: InvoiceItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  taxRate: number
  taxAmount: number
}

export interface Payment {
  id: string
  invoiceId: string
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'e_wallet'
  amount: number
  paymentDate: string
  referenceNumber: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Receipt {
  id: string
  paymentId: string
  invoiceId: string
  receiptNumber: string
  receiptDate: string
  totalPaid: number
  remainingBalance: number
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'e_wallet'
  items: ReceiptItem[]
  notes?: string
  createdAt: string
  updatedAt: string
  // Relations
  payment?: Payment
  invoice?: Invoice
}

export interface ReceiptItem {
  id: string
  receiptId: string
  invoiceItemId: string
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  taxAmount: number
  paidAmount: number
}

// DTOs for API calls
export interface CreateInvoiceDTO {
  invoiceNumber?: string
  invoiceDate?: string
  dueDate?: string
  customerId?: string
  customerName?: string
  customerEmail?: string
  items: CreateInvoiceItemDTO[]
  notes?: string
}

export interface CreateInvoiceItemDTO {
  description: string
  quantity: number
  unitPrice: number
  taxRate?: number
  lineTotal?: number
}

export interface CreatePaymentDTO {
  invoiceId: string
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'e_wallet'
  amount: number
  paymentDate?: string
  referenceNumber?: string
  notes?: string
}

// Dashboard Statistics
export interface DashboardStats {
  totalInvoices: {
    count: number
    amount: number
  }
  outstandingAmount: {
    count: number
    amount: number
  }
  paidToday: {
    count: number
    amount: number
  }
  recentTransactions: (Invoice & { type: 'invoice' | 'payment' })[]
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  timestamp: string
}

// Form validation
export interface ValidationError {
  field: string
  message: string
}

// Payment result from processing
export interface PaymentResult {
  payment: Payment
  invoice: Invoice
  receipt?: Receipt
  isFullyPaid: boolean
  isOverpayment: boolean
  overpaymentAmount: number
  remainingBalance: number
}
