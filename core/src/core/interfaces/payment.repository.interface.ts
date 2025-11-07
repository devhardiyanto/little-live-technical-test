import { Payment, CreatePaymentInput } from '@/core/types'

export interface IPaymentRepository {
  /**
   * Create a new payment
   */
  create(data: Partial<Payment>): Promise<Payment>

  /**
   * Find payment by ID
   */
  findById(id: string): Promise<Payment | null>

  /**
   * Find payment by reference number
   */
  findByReferenceNumber(referenceNumber: string): Promise<Payment | null>

  /**
   * Find all payments for an invoice
   */
  findByInvoiceId(invoiceId: string): Promise<Payment[]>

  /**
   * Find all payments (with optional filters)
   */
  findAll(filters?: {
    status?: string
    paymentMethod?: string
    limit?: number
    offset?: number
  }): Promise<Payment[]>

  /**
   * Update payment status
   */
  updateStatus(id: string, status: string): Promise<Payment>

  /**
   * Delete payment
   */
  delete(id: string): Promise<boolean>
}
