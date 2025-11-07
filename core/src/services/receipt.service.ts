import { IReceiptRepository } from '@/core/interfaces/receipt.repository.interface'
import { Receipt } from '@/core/types'
import { NotFoundException } from '@/core/exceptions'

export class ReceiptService {
  constructor(private receiptRepository: IReceiptRepository) {}

  /**
   * Get receipt by ID
   */
  async getReceiptById(id: string): Promise<Receipt> {
    const receipt = await this.receiptRepository.findById(id)

    if (!receipt) {
      throw new NotFoundException(`Receipt with id ${id} not found`)
    }

    return receipt
  }

  /**
   * Get receipt by payment ID
   */
  async getReceiptByPaymentId(paymentId: string): Promise<Receipt> {
    const receipt = await this.receiptRepository.findByPaymentId(paymentId)

    if (!receipt) {
      throw new NotFoundException(`Receipt for payment ${paymentId} not found`)
    }

    return receipt
  }

  /**
   * Get receipt by receipt number
   */
  async getReceiptByNumber(receiptNumber: string): Promise<Receipt> {
    const receipt = await this.receiptRepository.findByReceiptNumber(receiptNumber)

    if (!receipt) {
      throw new NotFoundException(`Receipt with number ${receiptNumber} not found`)
    }

    return receipt
  }

  /**
   * Get all receipts for an invoice
   */
  async getReceiptsByInvoiceId(invoiceId: string): Promise<Receipt[]> {
    return await this.receiptRepository.findByInvoiceId(invoiceId)
  }

  /**
   * Get all receipts
   */
  async getAllReceipts(filters?: {
    limit?: number
    offset?: number
  }): Promise<Receipt[]> {
    return await this.receiptRepository.findAll(filters)
  }
}
