import { IInvoiceRepository } from '@/core/interfaces/invoice.repository.interface'
import {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceStatus
} from '@/core/types'
import { NotFoundException, ValidationException } from '@/core/exceptions'

export class InvoiceService {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  /**
   * Create a new invoice
   */
  async createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new ValidationException('Invoice must have at least one item')
    }

    // Validate each item
    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new ValidationException(`Invalid quantity for item "${item.description}"`)
      }
      if (item.unitPrice < 0) {
        throw new ValidationException(`Invalid unit price for item "${item.description}"`)
      }
    }

    // Create invoice
    const invoice = await this.invoiceRepository.create(data)

    return invoice
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id)

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`)
    }

    return invoice
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber)

    if (!invoice) {
      throw new NotFoundException(`Invoice with number ${invoiceNumber} not found`)
    }

    return invoice
  }

  /**
   * Get all invoices with optional filters
   */
  async getAllInvoices(filters?: {
    status?: string
    customerId?: string
    limit?: number
    offset?: number
  }): Promise<Invoice[]> {
    return await this.invoiceRepository.findAll(filters)
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
    // Check if invoice exists
    const existing = await this.invoiceRepository.findById(id)
    if (!existing) {
      throw new NotFoundException(`Invoice with id ${id} not found`)
    }

    // Cannot update if invoice is paid
    if (existing.status === InvoiceStatus.PAID) {
      throw new ValidationException('Cannot update a paid invoice')
    }

    return await this.invoiceRepository.update(id, data)
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: string): Promise<boolean> {
    // Check if invoice exists
    const existing = await this.invoiceRepository.findById(id)
    if (!existing) {
      throw new NotFoundException(`Invoice with id ${id} not found`)
    }

    // Cannot delete if invoice has payments
    if (existing.outstandingAmount < existing.totalAmount) {
      throw new ValidationException('Cannot delete invoice with payments')
    }

    return await this.invoiceRepository.delete(id)
  }

  /**
   * Get invoice statistics
   */
  async getStatistics(filters?: { customerId?: string }): Promise<{
    total: number
    pending: number
    partiallyPaid: number
    paid: number
    overdue: number
    totalAmount: number
    totalOutstanding: number
  }> {
    const invoices = await this.invoiceRepository.findAll(filters)

    const stats = {
      total: invoices.length,
      pending: 0,
      partiallyPaid: 0,
      paid: 0,
      overdue: 0,
      totalAmount: 0,
      totalOutstanding: 0
    }

    for (const invoice of invoices) {
      stats.totalAmount += invoice.totalAmount
      stats.totalOutstanding += invoice.outstandingAmount

      switch (invoice.status) {
        case InvoiceStatus.PENDING:
          stats.pending++
          break
        case InvoiceStatus.PARTIALLY_PAID:
          stats.partiallyPaid++
          break
        case InvoiceStatus.PAID:
          stats.paid++
          break
        case InvoiceStatus.OVERDUE:
          stats.overdue++
          break
      }
    }

    return stats
  }
}
