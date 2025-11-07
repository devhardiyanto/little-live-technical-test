import { Receipt, ReceiptItem } from '@/core/types'

export interface IReceiptRepository {
  /**
   * Create a new receipt with items
   */
  create(
    receiptData: Partial<Receipt>,
    items: Partial<ReceiptItem>[]
  ): Promise<Receipt>

  /**
   * Find receipt by ID (with items)
   */
  findById(id: string): Promise<Receipt | null>

  /**
   * Find receipt by payment ID
   */
  findByPaymentId(paymentId: string): Promise<Receipt | null>

  /**
   * Find receipt by receipt number
   */
  findByReceiptNumber(receiptNumber: string): Promise<Receipt | null>

  /**
   * Find all receipts for an invoice
   */
  findByInvoiceId(invoiceId: string): Promise<Receipt[]>

  /**
   * Find all receipts (with optional filters)
   */
  findAll(filters?: {
    limit?: number
    offset?: number
  }): Promise<Receipt[]>

  /**
   * Get receipt items by receipt ID
   */
  getItemsByReceiptId(receiptId: string): Promise<ReceiptItem[]>

  /**
   * Delete receipt (and cascade delete items)
   */
  delete(id: string): Promise<boolean>
}
