import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { PaymentController } from '@/api/controllers/payment.controller'
import {
  createPaymentSchema,
  paymentFiltersSchema
} from '@/api/validators/schemas/payment.schema'

export const createPaymentRoutes = (controller: PaymentController) => {
  const router = new Hono()

  // Get statistics (must be before /:id to avoid conflict)
  router.get('/statistics', controller.getStatistics)

  // Get payment by reference
  router.get('/reference/:referenceNumber', controller.getByReference)

  // Get payments by invoice
  router.get('/invoice/:invoiceId', controller.getByInvoiceId)

  // Create payment (process payment)
  router.post('/', zValidator('json', createPaymentSchema), controller.create)

  // Get all payments
  router.get('/', zValidator('query', paymentFiltersSchema), controller.getAll)

  // Get payment by ID
  router.get('/:id', controller.getById)

  return router
}
