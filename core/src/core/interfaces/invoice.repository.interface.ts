import { Invoice, InvoiceItem, CreateInvoiceInput, UpdateInvoiceInput } from '@/core/types'

export interface IInvoiceRepository {
  /**
   * Create a new invoice with items
   */
  create(data: CreateInvoiceInput): Promise<Invoice>

  /**
   * Find invoice by ID (with items)
   */
  findById(id: string): Promise<Invoice | null>

  /**
   * Find invoice by invoice number
   */
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>

  /**
   * Find all invoices (with optional filters)
   */
  findAll(filters?: {
    status?: string
    customerId?: string
    limit?: number
    offset?: number
  }): Promise<Invoice[]>

  /**
   * Update invoice
   */
  update(id: string, data: UpdateInvoiceInput): Promise<Invoice>

  /**
   * Update invoice outstanding amount and status
   */
  updateOutstanding(id: string, outstandingAmount: number, status: string): Promise<Invoice>

  /**
   * Delete invoice (and cascade delete items)
   */
  delete(id: string): Promise<boolean>

  /**
   * Get invoice items by invoice ID
   */
  getItemsByInvoiceId(invoiceId: string): Promise<InvoiceItem[]>
}
