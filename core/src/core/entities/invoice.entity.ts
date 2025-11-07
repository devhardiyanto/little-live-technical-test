import {
  Invoice as InvoiceType,
  InvoiceItem as InvoiceItemType,
  InvoiceStatus,
  CreateInvoiceItemInput,
  InvoiceTotals
} from '@/core/types'

/**
 * Invoice Entity
 * Represents a billing invoice with line items
 */
export class InvoiceEntity {
  id: string
  invoiceNumber: string
  invoiceDate: Date
  dueDate?: Date
  customerId?: string
  customerName?: string
  customerEmail?: string
  items: InvoiceItemType[]
  subtotal: number
  totalTax: number
  totalAmount: number
  outstandingAmount: number
  status: InvoiceStatus
  notes?: string
  createdAt: Date
  updatedAt: Date

  constructor(data: InvoiceType) {
    this.id = data.id
    this.invoiceNumber = data.invoiceNumber
    this.invoiceDate = data.invoiceDate
    this.dueDate = data.dueDate
    this.customerId = data.customerId
    this.customerName = data.customerName
    this.customerEmail = data.customerEmail
    this.items = data.items
    this.subtotal = data.subtotal
    this.totalTax = data.totalTax
    this.totalAmount = data.totalAmount
    this.outstandingAmount = data.outstandingAmount
    this.status = data.status
    this.notes = data.notes
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  /**
   * Check if invoice is fully paid
   */
  isFullyPaid(): boolean {
    return this.outstandingAmount <= 0 && this.status === InvoiceStatus.PAID
  }

  /**
   * Check if invoice is partially paid
   */
  isPartiallyPaid(): boolean {
    return this.outstandingAmount > 0 && this.outstandingAmount < this.totalAmount
  }

  /**
   * Check if invoice is overdue
   */
  isOverdue(): boolean {
    if (!this.dueDate) return false
    const now = new Date()
    return now > this.dueDate && !this.isFullyPaid()
  }

  /**
   * Calculate total paid amount
   */
  getTotalPaid(): number {
    return this.totalAmount - this.outstandingAmount
  }

  /**
   * Update outstanding amount after payment
   */
  applyPayment(amount: number): void {
    this.outstandingAmount = Math.max(0, this.outstandingAmount - amount)

    // Update status
    if (this.outstandingAmount === 0) {
      this.status = InvoiceStatus.PAID
    } else if (this.outstandingAmount < this.totalAmount) {
      this.status = InvoiceStatus.PARTIALLY_PAID
    }

    this.updatedAt = new Date()
  }

  /**
   * Convert to plain object
   */
  toJSON(): InvoiceType {
    return {
      id: this.id,
      invoiceNumber: this.invoiceNumber,
      invoiceDate: this.invoiceDate,
      dueDate: this.dueDate,
      customerId: this.customerId,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      items: this.items,
      subtotal: this.subtotal,
      totalTax: this.totalTax,
      totalAmount: this.totalAmount,
      outstandingAmount: this.outstandingAmount,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

/**
 * Invoice Item Entity
 */
export class InvoiceItemEntity {
  id: string
  invoiceId?: string
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  taxRate: number
  taxAmount: number
  createdAt?: Date
  updatedAt?: Date

  constructor(data: InvoiceItemType) {
    this.id = data.id
    this.invoiceId = data.invoiceId
    this.description = data.description
    this.quantity = data.quantity
    this.unitPrice = data.unitPrice
    this.lineTotal = data.lineTotal
    this.taxRate = data.taxRate
    this.taxAmount = data.taxAmount
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  /**
   * Calculate line total and tax amount
   */
  static calculateTotals(input: CreateInvoiceItemInput): { lineTotal: number; taxAmount: number } {
    const lineTotal = input.quantity * input.unitPrice
    const taxRate = input.taxRate ?? 0.07 // Default 7% GST
    const taxAmount = lineTotal * taxRate

    return {
      lineTotal: Math.round(lineTotal * 100) / 100,  // Round to 2 decimals
      taxAmount: Math.round(taxAmount * 100) / 100
    }
  }

  /**
   * Convert to plain object
   */
  toJSON(): InvoiceItemType {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      lineTotal: this.lineTotal,
      taxRate: this.taxRate,
      taxAmount: this.taxAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

/**
 * Calculate invoice totals from items
 */
export function calculateInvoiceTotals(items: CreateInvoiceItemInput[]): InvoiceTotals {
  let subtotal = 0
  let totalTax = 0

  for (const item of items) {
    const { lineTotal, taxAmount } = InvoiceItemEntity.calculateTotals(item)
    subtotal += lineTotal
    totalTax += taxAmount
  }

  // Round to 2 decimal places
  subtotal = Math.round(subtotal * 100) / 100
  totalTax = Math.round(totalTax * 100) / 100
  const totalAmount = Math.round((subtotal + totalTax) * 100) / 100

  return {
    subtotal,
    totalTax,
    totalAmount
  }
}
