import { Context } from 'hono'
import { InvoiceService } from '@/services/invoice.service'
import { ApiResponse } from '@/shared/utils/response.util'

const successResponse = ApiResponse.success
const errorResponse = ApiResponse.error

export class InvoiceController {
  constructor(private invoiceService: InvoiceService) { }

  /**
   * Create a new invoice
   * POST /api/v1/invoices
   */
  create = async (c: Context) => {
    try {
      const body = await c.req.json()
      const invoice = await this.invoiceService.createInvoice(body)

      return c.json(
        successResponse(invoice, 'Invoice created successfully'),
        201
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 400
      )
    }
  }

  /**
   * Get all invoices
   * GET /api/v1/invoices
   */
  getAll = async (c: Context) => {
    try {
      const { status, customerId, limit, offset } = c.req.query()

      const filters = {
        status,
        customerId,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      }

      const invoices = await this.invoiceService.getAllInvoices(filters)

      return c.json(
        successResponse(invoices, 'Invoices retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 400
      )
    }
  }

  /**
   * Get invoice by ID
   * GET /api/v1/invoices/:id
   */
  getById = async (c: Context) => {
    try {
      const id = c.req.param('id')
      const invoice = await this.invoiceService.getInvoiceById(id)

      return c.json(
        successResponse(invoice, 'Invoice retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Get invoice by number
   * GET /api/v1/invoices/number/:invoiceNumber
   */
  getByNumber = async (c: Context) => {
    try {
      const invoiceNumber = c.req.param('invoiceNumber')
      const invoice = await this.invoiceService.getInvoiceByNumber(invoiceNumber)

      return c.json(
        successResponse(invoice, 'Invoice retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Update invoice
   * PUT /api/v1/invoices/:id
   */
  update = async (c: Context) => {
    try {
      const id = c.req.param('id')
      const body = await c.req.json()
      const invoice = await this.invoiceService.updateInvoice(id, body)

      return c.json(
        successResponse(invoice, 'Invoice updated successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 400
      )
    }
  }

  /**
   * Delete invoice
   * DELETE /api/v1/invoices/:id
   */
  delete = async (c: Context) => {
    try {
      const id = c.req.param('id')
      await this.invoiceService.deleteInvoice(id)

      return c.json(
        successResponse(null, 'Invoice deleted successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 400
      )
    }
  }

  /**
   * Get invoice statistics
   * GET /api/v1/invoices/statistics
   */
  getStatistics = async (c: Context) => {
    try {
      const { customerId } = c.req.query()
      const stats = await this.invoiceService.getStatistics({ customerId })

      return c.json(
        successResponse(stats, 'Statistics retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 400
      )
    }
  }
}
