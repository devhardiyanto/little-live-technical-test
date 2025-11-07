import { Context } from 'hono'
import { PaymentService } from '@/services/payment.service'
import { ApiResponse } from '@/shared/utils/response.util'

const successResponse = ApiResponse.success
const errorResponse = ApiResponse.error

export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  /**
   * Process a payment for an invoice
   * POST /api/v1/payments
   */
  create = async (c: Context) => {
    try {
      const body = await c.req.json()
      const result = await this.paymentService.processInvoicePayment(body)

      // Add helpful message about payment status
      let message = 'Payment processed successfully'
      if (result.isOverpayment) {
        message += `. Overpayment of $${result.overpaymentAmount.toFixed(2)} detected`
      } else if (result.isFullyPaid) {
        message += '. Invoice is now fully paid'
      } else {
        message += `. Remaining balance: $${result.invoice.outstandingAmount.toFixed(2)}`
      }

      return c.json(
        successResponse(result, message),
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
   * Get all payments
   * GET /api/v1/payments
   */
  getAll = async (c: Context) => {
    try {
      const { status, paymentMethod, limit, offset } = c.req.query()

      const filters = {
        status,
        paymentMethod,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      }

      const payments = await this.paymentService.getAllPayments(filters)

      return c.json(
        successResponse(payments, 'Payments retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 400
      )
    }
  }

  /**
   * Get payment by ID
   * GET /api/v1/payments/:id
   */
  getById = async (c: Context) => {
    try {
      const id = c.req.param('id')
      const payment = await this.paymentService.getPaymentById(id)

      return c.json(
        successResponse(payment, 'Payment retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Get payment by reference number
   * GET /api/v1/payments/reference/:referenceNumber
   */
  getByReference = async (c: Context) => {
    try {
      const referenceNumber = c.req.param('referenceNumber')
      const payment = await this.paymentService.getPaymentByReference(referenceNumber)

      return c.json(
        successResponse(payment, 'Payment retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Get payments by invoice ID
   * GET /api/v1/payments/invoice/:invoiceId
   */
  getByInvoiceId = async (c: Context) => {
    try {
      const invoiceId = c.req.param('invoiceId')
      const payments = await this.paymentService.getPaymentsByInvoiceId(invoiceId)

      return c.json(
        successResponse(payments, 'Payments retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Get payment statistics
   * GET /api/v1/payments/statistics
   */
  getStatistics = async (c: Context) => {
    try {
      const { invoiceId } = c.req.query()
      const stats = await this.paymentService.getStatistics({ invoiceId })

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
