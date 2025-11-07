import { IPaymentRepository } from '@/core/interfaces/payment.repository.interface'
import { IInvoiceRepository } from '@/core/interfaces/invoice.repository.interface'
import { IReceiptRepository } from '@/core/interfaces/receipt.repository.interface'
import {
  Payment,
  Receipt,
  CreatePaymentInput,
  PaymentResult,
  InvoiceStatus
} from '@/core/types'
import { processPayment, generateReceipt } from '@/core/utils'
import { NotFoundException, ValidationException } from '@/core/exceptions'

export class PaymentService {
  constructor(
    private paymentRepository: IPaymentRepository,
    private invoiceRepository: IInvoiceRepository,
    private receiptRepository: IReceiptRepository
  ) {}

  /**
   * Process a payment for an invoice
   * This is the main function that handles the full payment flow
   */
  async processInvoicePayment(data: CreatePaymentInput): Promise<PaymentResult> {
    // Get invoice
    const invoice = await this.invoiceRepository.findById(data.invoiceId)
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${data.invoiceId} not found`)
    }

    // Validate payment
    if (data.amount <= 0) {
      throw new ValidationException('Payment amount must be greater than zero')
    }

    if (invoice.outstandingAmount <= 0) {
      throw new ValidationException('Invoice is already fully paid')
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new ValidationException('Cannot process payment for cancelled invoice')
    }

    // Process payment using business logic
    const paymentResult = processPayment(invoice, data.amount, data)

    // Create payment record
    const payment = await this.paymentRepository.create(paymentResult.payment)

    // Update invoice
    const updatedInvoice = await this.invoiceRepository.updateOutstanding(
      invoice.id,
      paymentResult.updatedInvoice.outstandingAmount!,
      paymentResult.updatedInvoice.status!
    )

    // Generate and create receipt
    const receiptData = generateReceipt(payment, updatedInvoice)
    const receipt = await this.receiptRepository.create(
      receiptData.receipt,
      receiptData.receiptItems
    )

    return {
      payment,
      invoice: updatedInvoice,
      receipt,
      isFullyPaid: paymentResult.isFullyPaid,
      isOverpayment: paymentResult.isOverpayment,
      overpaymentAmount: paymentResult.overpaymentAmount
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id)

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`)
    }

    return payment
  }

  /**
   * Get payment by reference number
   */
  async getPaymentByReference(referenceNumber: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByReferenceNumber(referenceNumber)

    if (!payment) {
      throw new NotFoundException(`Payment with reference ${referenceNumber} not found`)
    }

    return payment
  }

  /**
   * Get all payments for an invoice
   */
  async getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return await this.paymentRepository.findByInvoiceId(invoiceId)
  }

  /**
   * Get all payments with optional filters
   */
  async getAllPayments(filters?: {
    status?: string
    paymentMethod?: string
    limit?: number
    offset?: number
  }): Promise<Payment[]> {
    return await this.paymentRepository.findAll(filters)
  }

  /**
   * Get payment statistics
   */
  async getStatistics(filters?: { invoiceId?: string }): Promise<{
    total: number
    totalAmount: number
    completed: number
    pending: number
    failed: number
  }> {
    let payments: Payment[]

    if (filters?.invoiceId) {
      payments = await this.paymentRepository.findByInvoiceId(filters.invoiceId)
    } else {
      payments = await this.paymentRepository.findAll()
    }

    const stats = {
      total: payments.length,
      totalAmount: 0,
      completed: 0,
      pending: 0,
      failed: 0
    }

    for (const payment of payments) {
      stats.totalAmount += payment.amount

      if (payment.status === 'completed') {
        stats.completed++
      } else if (payment.status === 'pending') {
        stats.pending++
      } else if (payment.status === 'failed') {
        stats.failed++
      }
    }

    return stats
  }
}
