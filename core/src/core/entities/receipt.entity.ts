import {
  Receipt as ReceiptType,
  ReceiptItem as ReceiptItemType,
  PaymentMethod
} from '@/core/types'

/**
 * Receipt Entity
 * Represents a payment receipt/confirmation
 */
export class ReceiptEntity {
  id: string
  paymentId: string
  invoiceId: string
  receiptNumber: string
  receiptDate: Date
  totalPaid: number
  remainingBalance: number
  items: ReceiptItemType[]
  paymentMethod: PaymentMethod
  notes?: string
  createdAt: Date
  updatedAt: Date

  constructor(data: ReceiptType) {
    this.id = data.id
    this.paymentId = data.paymentId
    this.invoiceId = data.invoiceId
    this.receiptNumber = data.receiptNumber
    this.receiptDate = data.receiptDate
    this.totalPaid = data.totalPaid
    this.remainingBalance = data.remainingBalance
    this.items = data.items
    this.paymentMethod = data.paymentMethod
    this.notes = data.notes
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  /**
   * Generate receipt number
   */
  static generateReceiptNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `RCP-${timestamp}-${random}`
  }

  /**
   * Check if this is a full payment receipt
   */
  isFullPayment(): boolean {
    return this.remainingBalance === 0
  }

  /**
   * Check if this is a partial payment receipt
   */
  isPartialPayment(): boolean {
    return this.remainingBalance > 0
  }

  /**
   * Check if this is an overpayment receipt
   */
  isOverpayment(): boolean {
    return this.remainingBalance < 0
  }

  /**
   * Get overpayment amount (positive number)
   */
  getOverpaymentAmount(): number {
    return this.remainingBalance < 0 ? Math.abs(this.remainingBalance) : 0
  }

  /**
   * Convert to plain object
   */
  toJSON(): ReceiptType {
    return {
      id: this.id,
      paymentId: this.paymentId,
      invoiceId: this.invoiceId,
      receiptNumber: this.receiptNumber,
      receiptDate: this.receiptDate,
      totalPaid: this.totalPaid,
      remainingBalance: this.remainingBalance,
      items: this.items,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

/**
 * Receipt Item Entity
 */
export class ReceiptItemEntity {
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

  constructor(data: ReceiptItemType) {
    this.id = data.id
    this.receiptId = data.receiptId
    this.invoiceItemId = data.invoiceItemId
    this.description = data.description
    this.quantity = data.quantity
    this.unitPrice = data.unitPrice
    this.lineTotal = data.lineTotal
    this.taxAmount = data.taxAmount
    this.paidAmount = data.paidAmount
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  /**
   * Convert to plain object
   */
  toJSON(): ReceiptItemType {
    return {
      id: this.id,
      receiptId: this.receiptId,
      invoiceItemId: this.invoiceItemId,
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      lineTotal: this.lineTotal,
      taxAmount: this.taxAmount,
      paidAmount: this.paidAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
