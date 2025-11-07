import { eq, and, desc } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/database/schema'
import { IPaymentRepository } from '@/core/interfaces/payment.repository.interface'
import { Payment, PaymentStatus, PaymentMethod } from '@/core/types'
import { NotFoundException } from '@/core/exceptions'

export class PaymentRepositoryImpl implements IPaymentRepository {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  async create(data: Partial<Payment>): Promise<Payment> {
    const [payment] = await this.db
      .insert(schema.payments)
      .values({
        invoiceId: data.invoiceId!,
        paymentMethod: data.paymentMethod!,
        amount: data.amount!.toString(),
        paymentDate: data.paymentDate || new Date(),
        referenceNumber: data.referenceNumber!,
        status: data.status || PaymentStatus.PENDING,
        notes: data.notes
      })
      .returning()

    return this.mapPayment(payment)
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.db.query.payments.findFirst({
      where: eq(schema.payments.id, id)
    })

    return payment ? this.mapPayment(payment) : null
  }

  async findByReferenceNumber(referenceNumber: string): Promise<Payment | null> {
    const payment = await this.db.query.payments.findFirst({
      where: eq(schema.payments.referenceNumber, referenceNumber)
    })

    return payment ? this.mapPayment(payment) : null
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const payments = await this.db.query.payments.findMany({
      where: eq(schema.payments.invoiceId, invoiceId),
      orderBy: [desc(schema.payments.paymentDate)]
    })

    return payments.map(this.mapPayment)
  }

  async findAll(filters?: {
    status?: string
    paymentMethod?: string
    limit?: number
    offset?: number
  }): Promise<Payment[]> {
    const conditions = []

    if (filters?.status) {
      conditions.push(eq(schema.payments.status, filters.status as any))
    }

    if (filters?.paymentMethod) {
      conditions.push(eq(schema.payments.paymentMethod, filters.paymentMethod as any))
    }

    const payments = await this.db.query.payments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.payments.createdAt)],
      limit: filters?.limit || 100,
      offset: filters?.offset || 0
    })

    return payments.map(this.mapPayment)
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    const [updated] = await this.db
      .update(schema.payments)
      .set({
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(schema.payments.id, id))
      .returning()

    if (!updated) {
      throw new NotFoundException(`Payment with id ${id} not found`)
    }

    return this.mapPayment(updated)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.payments)
      .where(eq(schema.payments.id, id))
      .returning()

    return result.length > 0
  }

  // Helper method to map database type to domain type
  private mapPayment(payment: any): Payment {
    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      paymentMethod: payment.paymentMethod as PaymentMethod,
      amount: parseFloat(payment.amount),
      paymentDate: payment.paymentDate,
      referenceNumber: payment.referenceNumber,
      status: payment.status as PaymentStatus,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }
  }
}
