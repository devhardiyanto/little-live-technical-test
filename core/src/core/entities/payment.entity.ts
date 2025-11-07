import { Payment as PaymentType, PaymentMethod, PaymentStatus } from '@/core/types'

/**
 * Payment Entity
 * Represents a payment made towards an invoice
 */
export class PaymentEntity {
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

  constructor(data: PaymentType) {
    this.id = data.id
    this.invoiceId = data.invoiceId
    this.paymentMethod = data.paymentMethod
    this.amount = data.amount
    this.paymentDate = data.paymentDate
    this.referenceNumber = data.referenceNumber
    this.status = data.status
    this.notes = data.notes
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero')
    }

    if (amount > 999999999.99) {
      throw new Error('Payment amount exceeds maximum allowed value')
    }

    // Check for valid decimal places (max 2)
    const decimalPlaces = (amount.toString().split('.')[1] || '').length
    if (decimalPlaces > 2) {
      throw new Error('Payment amount cannot have more than 2 decimal places')
    }
  }

  /**
   * Generate reference number
   */
  static generateReferenceNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `PAY-${timestamp}-${random}`
  }

  /**
   * Mark payment as completed
   */
  complete(): void {
    this.status = PaymentStatus.COMPLETED
    this.updatedAt = new Date()
  }

  /**
   * Mark payment as failed
   */
  fail(): void {
    this.status = PaymentStatus.FAILED
    this.updatedAt = new Date()
  }

  /**
   * Check if payment is completed
   */
  isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED
  }

  /**
   * Convert to plain object
   */
  toJSON(): PaymentType {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      paymentMethod: this.paymentMethod,
      amount: this.amount,
      paymentDate: this.paymentDate,
      referenceNumber: this.referenceNumber,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
