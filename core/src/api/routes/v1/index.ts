import { Hono } from 'hono'
import { createInvoiceRoutes } from './invoice.routes'
import { createPaymentRoutes } from './payment.routes'
import { createReceiptRoutes } from './receipt.routes'
import type { InvoiceController } from '@/api/controllers/invoice.controller'
import type { PaymentController } from '@/api/controllers/payment.controller'
import type { ReceiptController } from '@/api/controllers/receipt.controller'

export const createV1Routes = (
  invoiceController: InvoiceController,
  paymentController: PaymentController,
  receiptController: ReceiptController
) => {
  const router = new Hono()

  // Health check
  router.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'Payment System API'
    })
  })

  // Mount feature routes
  router.route('/invoices', createInvoiceRoutes(invoiceController))
  router.route('/payments', createPaymentRoutes(paymentController))
  router.route('/receipts', createReceiptRoutes(receiptController))

  return router
}
