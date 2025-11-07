import { pgTable, uuid, varchar, timestamp, decimal, text, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'pending',
  'partially_paid',
  'paid',
  'cancelled',
  'overdue'
])

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  invoiceDate: timestamp('invoice_date').notNull().defaultNow(),
  dueDate: timestamp('due_date'),
  customerId: varchar('customer_id', { length: 100 }),
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),

  // Calculated fields
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull().default('0'),
  totalTax: decimal('total_tax', { precision: 15, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  outstandingAmount: decimal('outstanding_amount', { precision: 15, scale: 2 }).notNull().default('0'),

  status: invoiceStatusEnum('status').notNull().default('draft'),
  notes: text('notes'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Invoice Items table
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),

  description: varchar('description', { length: 500 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 15, scale: 2 }).notNull(),

  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.07'), // 7% GST
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).notNull().default('0'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Types
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type InvoiceItem = typeof invoiceItems.$inferSelect
export type NewInvoiceItem = typeof invoiceItems.$inferInsert
