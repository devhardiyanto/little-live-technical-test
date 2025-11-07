import { OpenAPIHono } from '@hono/zod-openapi'
import type { InvoiceController } from '@/api/controllers/invoice.controller'
import type { PaymentController } from '@/api/controllers/payment.controller'
import type { ReceiptController } from '@/api/controllers/receipt.controller'

import { createInvoiceOpenAPIRoutes } from './routes/invoice.routes'
import { createPaymentOpenAPIRoutes } from './routes/payment.routes'
import { createReceiptOpenAPIRoutes } from './routes/receipt.routes'

export const createOpenAPIApp = (
  invoiceController: InvoiceController,
  paymentController: PaymentController,
  receiptController: ReceiptController
) => {
  const app = new OpenAPIHono()

  // Configure OpenAPI documentation
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Payment System API',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Invoices',
        description: 'Invoice management endpoints - Create, read, update, and delete invoices'
      },
      {
        name: 'Payments',
        description: 'Payment processing endpoints - Process payments and track payment history'
      },
      {
        name: 'Receipts',
        description: 'Receipt management endpoints - View payment receipts and confirmations'
      }
    ]
  })

  // Mount routes
  app.route('/invoices', createInvoiceOpenAPIRoutes(invoiceController))
  app.route('/payments', createPaymentOpenAPIRoutes(paymentController))
  app.route('/receipts', createReceiptOpenAPIRoutes(receiptController))

  return app
}
