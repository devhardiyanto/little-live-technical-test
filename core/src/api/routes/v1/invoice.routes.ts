import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { InvoiceController } from '@/api/controllers/invoice.controller'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceFiltersSchema
} from '@/api/validators/schemas/invoice.schema'

export const createInvoiceRoutes = (controller: InvoiceController) => {
  const router = new Hono()

  // Get statistics (must be before /:id to avoid conflict)
  router.get('/statistics', controller.getStatistics)

  // Get invoice by number
  router.get('/number/:invoiceNumber', controller.getByNumber)

  // Create invoice
  router.post('/', zValidator('json', createInvoiceSchema), controller.create)

  // Get all invoices
  router.get('/', zValidator('query', invoiceFiltersSchema), controller.getAll)

  // Get invoice by ID
  router.get('/:id', controller.getById)

  // Update invoice
  router.put('/:id', zValidator('json', updateInvoiceSchema), controller.update)

  // Delete invoice
  router.delete('/:id', controller.delete)

  return router
}
