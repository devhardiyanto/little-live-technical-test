// Payment System Constants

/**
 * Tax rate constants
 */
export const TAX_RATES = {
  GST: 0.07, // 7% Goods and Services Tax
} as const

/**
 * Default tax rate for invoices
 */
export const DEFAULT_TAX_RATE = TAX_RATES.GST

/**
 * Tax rate percentage for display (already calculated to avoid floating point issues)
 */
export const DEFAULT_TAX_RATE_PERCENT = 7

/**
 * Payment method labels for display
 */
export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  e_wallet: 'E-Wallet',
} as const

/**
 * Invoice status labels and colors
 */
export const INVOICE_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  partially_paid: {
    label: 'Partially Paid',
    color: 'bg-blue-100 text-blue-800',
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-800',
  },
} as const

/**
 * Payment status labels
 */
export const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} as const

/**
 * Currency formatting options
 */
export const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

/**
 * Date formatting options
 */
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

export const DATETIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  MAX_AMOUNT: 999999999.99,
  MIN_QUANTITY: 0,
  MIN_UNIT_PRICE: 0,
  MAX_DECIMAL_PLACES: 2,
} as const

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  BASE: '/api/v1',
  INVOICES: '/api/v1/invoices',
  PAYMENTS: '/api/v1/payments',
  RECEIPTS: '/api/v1/receipts',
} as const
