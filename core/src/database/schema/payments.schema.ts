import { pgTable, uuid, varchar, timestamp, decimal, text, pgEnum } from 'drizzle-orm/pg-core'
import { invoices } from './invoices.schema'

// Enums
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'bank_transfer',
  'credit_card',
  'debit_card',
  'e_wallet'
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'completed',
  'failed',
  'cancelled',
  'refunded'
])

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'restrict' }),

  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  paymentDate: timestamp('payment_date').notNull().defaultNow(),
  referenceNumber: varchar('reference_number', { length: 100 }).notNull().unique(),

  status: paymentStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Types
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
