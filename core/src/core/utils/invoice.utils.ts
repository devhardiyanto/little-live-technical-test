import { CreateInvoiceItemInput, InvoiceTotals } from '@/core/types'

/**
 * Calculate invoice totals from line items
 * @param items - Array of invoice items
 * @param taxRate - Tax rate (default 0.07 for 7% GST)
 * @returns Invoice totals (subtotal, totalTax, totalAmount)
 */
export function calculateInvoiceTotal(
  items: CreateInvoiceItemInput[],
  taxRate: number = 0.07
): InvoiceTotals {
  // Validate inputs
  if (!items || items.length === 0) {
    throw new Error('Invoice must have at least one item')
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1')
  }

  let subtotal = 0
  let totalTax = 0

  for (const item of items) {
    // Validate item
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for item "${item.description}": must be greater than 0`)
    }

    if (item.unitPrice < 0) {
      throw new Error(`Invalid unit price for item "${item.description}": cannot be negative`)
    }

    // Calculate line total
    const lineTotal = item.quantity * item.unitPrice
    const itemTaxRate = item.taxRate ?? taxRate
    const taxAmount = lineTotal * itemTaxRate

    subtotal += lineTotal
    totalTax += taxAmount
  }

  // Round to 2 decimal places to avoid floating point issues
  subtotal = Math.round(subtotal * 100) / 100
  totalTax = Math.round(totalTax * 100) / 100
  const totalAmount = Math.round((subtotal + totalTax) * 100) / 100

  return {
    subtotal,
    totalTax,
    totalAmount
  }
}

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXX
 */
export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')

  return `INV-${year}${month}${day}-${random}`
}

/**
 * Validate invoice amount
 */
export function validateInvoiceAmount(amount: number): void {
  if (amount < 0) {
    throw new Error('Invoice amount cannot be negative')
  }

  if (amount > 999999999.99) {
    throw new Error('Invoice amount exceeds maximum allowed value')
  }
}
