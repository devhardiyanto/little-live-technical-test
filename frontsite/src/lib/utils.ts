import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  CURRENCY_FORMAT_OPTIONS,
  DATE_FORMAT_OPTIONS,
  DATETIME_FORMAT_OPTIONS,
  PAYMENT_METHOD_LABELS,
  INVOICE_STATUS_CONFIG,
} from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', CURRENCY_FORMAT_OPTIONS).format(amount)
}

/**
 * Format date string
 */
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)
}

/**
 * Format datetime string
 */
export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', DATETIME_FORMAT_OPTIONS)
}

/**
 * Format payment method for display
 */
export function formatPaymentMethod(method?: string): string {
  if (!method) return 'N/A'
  return PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  const config = INVOICE_STATUS_CONFIG[status as keyof typeof INVOICE_STATUS_CONFIG]
  return config?.label || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status: string): string {
  const config = INVOICE_STATUS_CONFIG[status as keyof typeof INVOICE_STATUS_CONFIG]
  return config?.color || 'bg-gray-100 text-gray-800'
}
