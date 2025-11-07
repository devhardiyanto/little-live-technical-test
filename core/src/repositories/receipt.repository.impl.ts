import { eq, desc } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/database/schema'
import { IReceiptRepository } from '@/core/interfaces/receipt.repository.interface'
import { Receipt, ReceiptItem, PaymentMethod } from '@/core/types'
import { NotFoundException } from '@/core/exceptions'

export class ReceiptRepositoryImpl implements IReceiptRepository {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  async create(
    receiptData: Partial<Receipt>,
    items: Partial<ReceiptItem>[]
  ): Promise<Receipt> {
    const result = await this.db.transaction(async (tx) => {
      // Insert receipt
      const [receipt] = await tx
        .insert(schema.receipts)
        .values({
          paymentId: receiptData.paymentId!,
          invoiceId: receiptData.invoiceId!,
          receiptNumber: receiptData.receiptNumber!,
          receiptDate: receiptData.receiptDate || new Date(),
          totalPaid: receiptData.totalPaid!.toString(),
          remainingBalance: receiptData.remainingBalance!.toString(),
          paymentMethod: receiptData.paymentMethod!,
          notes: receiptData.notes
        })
        .returning()

      // Insert receipt items
      const receiptItems = await Promise.all(
        items.map(async (item) => {
          const [receiptItem] = await tx
            .insert(schema.receiptItems)
            .values({
              receiptId: receipt.id,
              invoiceItemId: item.invoiceItemId!,
              description: item.description!,
              quantity: item.quantity!.toString(),
              unitPrice: item.unitPrice!.toString(),
              lineTotal: item.lineTotal!.toString(),
              taxAmount: item.taxAmount!.toString(),
              paidAmount: item.paidAmount!.toString()
            })
            .returning()

          return this.mapReceiptItem(receiptItem)
        })
      )

      return {
        ...this.mapReceipt(receipt),
        items: receiptItems
      }
    })

    return result
  }

  async findById(id: string): Promise<Receipt | null> {
    const receipt = await this.db.query.receipts.findFirst({
      where: eq(schema.receipts.id, id)
    })

    if (!receipt) return null

    const items = await this.getItemsByReceiptId(id)

    return {
      ...this.mapReceipt(receipt),
      items
    }
  }

  async findByPaymentId(paymentId: string): Promise<Receipt | null> {
    const receipt = await this.db.query.receipts.findFirst({
      where: eq(schema.receipts.paymentId, paymentId)
    })

    if (!receipt) return null

    const items = await this.getItemsByReceiptId(receipt.id)

    return {
      ...this.mapReceipt(receipt),
      items
    }
  }

  async findByReceiptNumber(receiptNumber: string): Promise<Receipt | null> {
    const receipt = await this.db.query.receipts.findFirst({
      where: eq(schema.receipts.receiptNumber, receiptNumber)
    })

    if (!receipt) return null

    const items = await this.getItemsByReceiptId(receipt.id)

    return {
      ...this.mapReceipt(receipt),
      items
    }
  }

  async findByInvoiceId(invoiceId: string): Promise<Receipt[]> {
    const receipts = await this.db.query.receipts.findMany({
      where: eq(schema.receipts.invoiceId, invoiceId),
      orderBy: [desc(schema.receipts.receiptDate)]
    })

    const results = await Promise.all(
      receipts.map(async (receipt) => {
        const items = await this.getItemsByReceiptId(receipt.id)
        return {
          ...this.mapReceipt(receipt),
          items
        }
      })
    )

    return results
  }

  async findAll(filters?: {
    limit?: number
    offset?: number
  }): Promise<Receipt[]> {
    const receipts = await this.db.query.receipts.findMany({
      orderBy: [desc(schema.receipts.createdAt)],
      limit: filters?.limit || 100,
      offset: filters?.offset || 0
    })

    const results = await Promise.all(
      receipts.map(async (receipt) => {
        const items = await this.getItemsByReceiptId(receipt.id)
        return {
          ...this.mapReceipt(receipt),
          items
        }
      })
    )

    return results
  }

  async getItemsByReceiptId(receiptId: string): Promise<ReceiptItem[]> {
    const items = await this.db.query.receiptItems.findMany({
      where: eq(schema.receiptItems.receiptId, receiptId)
    })

    return items.map(this.mapReceiptItem)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.receipts)
      .where(eq(schema.receipts.id, id))
      .returning()

    return result.length > 0
  }

  // Helper methods to map database types to domain types
  private mapReceipt(receipt: any): Receipt {
    return {
      id: receipt.id,
      paymentId: receipt.paymentId,
      invoiceId: receipt.invoiceId,
      receiptNumber: receipt.receiptNumber,
      receiptDate: receipt.receiptDate,
      totalPaid: parseFloat(receipt.totalPaid),
      remainingBalance: parseFloat(receipt.remainingBalance),
      items: [],
      paymentMethod: receipt.paymentMethod as PaymentMethod,
      notes: receipt.notes,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt
    }
  }

  private mapReceiptItem(item: any): ReceiptItem {
    return {
      id: item.id,
      receiptId: item.receiptId,
      invoiceItemId: item.invoiceItemId,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      lineTotal: parseFloat(item.lineTotal),
      taxAmount: parseFloat(item.taxAmount),
      paidAmount: parseFloat(item.paidAmount),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  }
}
