import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { ReceiptController } from '@/api/controllers/receipt.controller'
import { receiptFiltersSchema } from '@/api/validators/schemas/receipt.schema'

export const createReceiptRoutes = (controller: ReceiptController) => {
  const router = new Hono()

  // Get receipt by payment ID
  router.get('/payment/:paymentId', controller.getByPaymentId)

  // Get receipt by number
  router.get('/number/:receiptNumber', controller.getByNumber)

  // Get receipts by invoice
  router.get('/invoice/:invoiceId', controller.getByInvoiceId)

  // Get all receipts
  router.get('/', zValidator('query', receiptFiltersSchema), controller.getAll)

  // Get receipt by ID
  router.get('/:id', controller.getById)

  return router
}
