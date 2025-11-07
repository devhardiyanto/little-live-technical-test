import { eq, and, desc } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/database/schema'
import { IInvoiceRepository } from '@/core/interfaces/invoice.repository.interface'
import {
  Invoice,
  InvoiceItem,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceStatus
} from '@/core/types'
import { calculateInvoiceTotal, generateInvoiceNumber } from '@/core/utils'
import { NotFoundException } from '@/core/exceptions'

export class InvoiceRepositoryImpl implements IInvoiceRepository {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  async create(data: CreateInvoiceInput): Promise<Invoice> {
    // Calculate totals
    const totals = calculateInvoiceTotal(data.items)

    // Generate invoice number if not provided
    const invoiceNumber = data.invoiceNumber || generateInvoiceNumber()

    // Start transaction
    const result = await this.db.transaction(async (tx) => {
      // Insert invoice
      const [invoice] = await tx
        .insert(schema.invoices)
        .values({
          invoiceNumber,
          invoiceDate: data.invoiceDate || new Date(),
          dueDate: data.dueDate,
          customerId: data.customerId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          subtotal: totals.subtotal.toString(),
          totalTax: totals.totalTax.toString(),
          totalAmount: totals.totalAmount.toString(),
          outstandingAmount: totals.totalAmount.toString(),
          status: InvoiceStatus.PENDING,
          notes: data.notes
        })
        .returning()

      // Insert invoice items
      const items = await Promise.all(
        data.items.map(async (item) => {
          const lineTotal = item.quantity * item.unitPrice
          const taxRate = item.taxRate ?? 0.07
          const taxAmount = lineTotal * taxRate

          const [invoiceItem] = await tx
            .insert(schema.invoiceItems)
            .values({
              invoiceId: invoice.id,
              description: item.description,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toString(),
              lineTotal: lineTotal.toString(),
              taxRate: taxRate.toString(),
              taxAmount: taxAmount.toString()
            })
            .returning()

          return this.mapInvoiceItem(invoiceItem)
        })
      )

      return {
        ...this.mapInvoice(invoice),
        items
      }
    })

    return result
  }

  async findById(id: string): Promise<Invoice | null> {
    const invoice = await this.db.query.invoices.findFirst({
      where: eq(schema.invoices.id, id)
    })

    if (!invoice) return null

    const items = await this.getItemsByInvoiceId(id)

    return {
      ...this.mapInvoice(invoice),
      items
    }
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const invoice = await this.db.query.invoices.findFirst({
      where: eq(schema.invoices.invoiceNumber, invoiceNumber)
    })

    if (!invoice) return null

    const items = await this.getItemsByInvoiceId(invoice.id)

    return {
      ...this.mapInvoice(invoice),
      items
    }
  }

  async findAll(filters?: {
    status?: string
    customerId?: string
    limit?: number
    offset?: number
  }): Promise<Invoice[]> {
    const conditions = []

    if (filters?.status) {
      conditions.push(eq(schema.invoices.status, filters.status as any))
    }

    if (filters?.customerId) {
      conditions.push(eq(schema.invoices.customerId, filters.customerId))
    }

    const invoices = await this.db.query.invoices.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.invoices.createdAt)],
      limit: filters?.limit || 100,
      offset: filters?.offset || 0
    })

    // Get items for each invoice
    const results = await Promise.all(
      invoices.map(async (invoice) => {
        const items = await this.getItemsByInvoiceId(invoice.id)
        return {
          ...this.mapInvoice(invoice),
          items
        }
      })
    )

    return results
  }

  async update(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
    const [updated] = await this.db
      .update(schema.invoices)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.invoices.id, id))
      .returning()

    if (!updated) {
      throw new NotFoundException(`Invoice with id ${id} not found`)
    }

    const items = await this.getItemsByInvoiceId(id)

    return {
      ...this.mapInvoice(updated),
      items
    }
  }

  async updateOutstanding(id: string, outstandingAmount: number, status: string): Promise<Invoice> {
    const [updated] = await this.db
      .update(schema.invoices)
      .set({
        outstandingAmount: outstandingAmount.toString(),
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(schema.invoices.id, id))
      .returning()

    if (!updated) {
      throw new NotFoundException(`Invoice with id ${id} not found`)
    }

    const items = await this.getItemsByInvoiceId(id)

    return {
      ...this.mapInvoice(updated),
      items
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.invoices)
      .where(eq(schema.invoices.id, id))
      .returning()

    return result.length > 0
  }

  async getItemsByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    const items = await this.db.query.invoiceItems.findMany({
      where: eq(schema.invoiceItems.invoiceId, invoiceId)
    })

    return items.map(this.mapInvoiceItem)
  }

  // Helper methods to map database types to domain types
  private mapInvoice(invoice: any): Invoice {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      items: [],
      subtotal: parseFloat(invoice.subtotal),
      totalTax: parseFloat(invoice.totalTax),
      totalAmount: parseFloat(invoice.totalAmount),
      outstandingAmount: parseFloat(invoice.outstandingAmount),
      status: invoice.status as InvoiceStatus,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    }
  }

  private mapInvoiceItem(item: any): InvoiceItem {
    return {
      id: item.id,
      invoiceId: item.invoiceId,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      lineTotal: parseFloat(item.lineTotal),
      taxRate: parseFloat(item.taxRate),
      taxAmount: parseFloat(item.taxAmount),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  }
}
