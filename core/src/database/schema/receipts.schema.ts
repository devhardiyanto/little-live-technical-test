import { pgTable, uuid, varchar, timestamp, decimal, text } from 'drizzle-orm/pg-core'
import { payments } from './payments.schema'
import { invoices, invoiceItems } from './invoices.schema'
import { paymentMethodEnum } from './payments.schema'

// Receipts table
export const receipts = pgTable('receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'restrict' }).unique(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'restrict' }),

  receiptNumber: varchar('receipt_number', { length: 50 }).notNull().unique(),
  receiptDate: timestamp('receipt_date').notNull().defaultNow(),

  totalPaid: decimal('total_paid', { precision: 15, scale: 2 }).notNull(),
  remainingBalance: decimal('remaining_balance', { precision: 15, scale: 2 }).notNull(),

  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  notes: text('notes'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Receipt Items table
export const receiptItems = pgTable('receipt_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  receiptId: uuid('receipt_id').notNull().references(() => receipts.id, { onDelete: 'cascade' }),
  invoiceItemId: uuid('invoice_item_id').notNull().references(() => invoiceItems.id, { onDelete: 'restrict' }),

  description: varchar('description', { length: 500 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Types
export type Receipt = typeof receipts.$inferSelect
export type NewReceipt = typeof receipts.$inferInsert
export type ReceiptItem = typeof receiptItems.$inferSelect
export type NewReceiptItem = typeof receiptItems.$inferInsert
