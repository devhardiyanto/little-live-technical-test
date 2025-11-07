import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { ReceiptController } from '@/api/controllers/receipt.controller'
import {
  ReceiptSchema,
  ReceiptQuerySchema,
  SuccessResponseSchema,
  ErrorSchema
} from '../schemas'

export const createReceiptOpenAPIRoutes = (controller: ReceiptController) => {
  const app = new OpenAPIHono()

  // Get All Receipts
  const getAllRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Receipts'],
    summary: 'Get all receipts',
    description: 'Retrieve all receipts',
    request: {
      query: ReceiptQuerySchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(z.array(ReceiptSchema))
          }
        },
        description: 'Receipts retrieved successfully'
      }
    }
  })

  // Get Receipt by ID
  const getByIdRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Receipts'],
    summary: 'Get receipt by ID',
    description: 'Retrieve a specific receipt',
    request: {
      params: z.object({
        id: z.string().uuid()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(ReceiptSchema)
          }
        },
        description: 'Receipt retrieved successfully'
      },
      404: {
        content: {
          'application/json': {
            schema: ErrorSchema
          }
        },
        description: 'Receipt not found'
      }
    }
  })

  // Get Receipt by Payment ID
  const getByPaymentRoute = createRoute({
    method: 'get',
    path: '/payment/{paymentId}',
    tags: ['Receipts'],
    summary: 'Get receipt by payment ID',
    description: 'Retrieve receipt for a specific payment',
    request: {
      params: z.object({
        paymentId: z.string().uuid()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(ReceiptSchema)
          }
        },
        description: 'Receipt retrieved successfully'
      },
      404: {
        content: {
          'application/json': {
            schema: ErrorSchema
          }
        },
        description: 'Receipt not found'
      }
    }
  })

  // Get Receipts by Invoice
  const getByInvoiceRoute = createRoute({
    method: 'get',
    path: '/invoice/{invoiceId}',
    tags: ['Receipts'],
    summary: 'Get receipts by invoice',
    description: 'Retrieve all receipts for a specific invoice',
    request: {
      params: z.object({
        invoiceId: z.string().uuid()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(z.array(ReceiptSchema))
          }
        },
        description: 'Receipts retrieved successfully'
      }
    }
  })

  // Register routes
  app.openapi(getByPaymentRoute, controller.getByPaymentId)
  app.openapi(getByInvoiceRoute, controller.getByInvoiceId)
  app.openapi(getAllRoute, controller.getAll)
  app.openapi(getByIdRoute, controller.getById)

  return app
}
