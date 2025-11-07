import { Context } from 'hono'
import { ReceiptService } from '@/services/receipt.service'
import { ApiResponse } from '@/shared/utils/response.util'

const successResponse = ApiResponse.success
const errorResponse = ApiResponse.error

export class ReceiptController {
  constructor(private receiptService: ReceiptService) { }

  /**
   * Get all receipts
   * GET /api/v1/receipts
   */
  getAll = async (c: Context) => {
    try {
      const { limit, offset } = c.req.query()

      const filters = {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      }

      const receipts = await this.receiptService.getAllReceipts(filters)

      return c.json(
        successResponse(receipts, 'Receipts retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 400
      )
    }
  }

  /**
   * Get receipt by ID
   * GET /api/v1/receipts/:id
   */
  getById = async (c: Context) => {
    try {
      const id = c.req.param('id')
      const receipt = await this.receiptService.getReceiptById(id)

      return c.json(
        successResponse(receipt, 'Receipt retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Get receipt by payment ID
   * GET /api/v1/receipts/payment/:paymentId
   */
  getByPaymentId = async (c: Context) => {
    try {
      const paymentId = c.req.param('paymentId')
      const receipt = await this.receiptService.getReceiptByPaymentId(paymentId)

      return c.json(
        successResponse(receipt, 'Receipt retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Get receipt by receipt number
   * GET /api/v1/receipts/number/:receiptNumber
   */
  getByNumber = async (c: Context) => {
    try {
      const receiptNumber = c.req.param('receiptNumber')
      const receipt = await this.receiptService.getReceiptByNumber(receiptNumber)

      return c.json(
        successResponse(receipt, 'Receipt retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }

  /**
   * Get receipts by invoice ID
   * GET /api/v1/receipts/invoice/:invoiceId
   */
  getByInvoiceId = async (c: Context) => {
    try {
      const invoiceId = c.req.param('invoiceId')
      const receipts = await this.receiptService.getReceiptsByInvoiceId(invoiceId)

      return c.json(
        successResponse(receipts, 'Receipts retrieved successfully')
      )
    } catch (error: any) {
      return c.json(
        errorResponse(error.message),
        error.statusCode || 404
      )
    }
  }
}
