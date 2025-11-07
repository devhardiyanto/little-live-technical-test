import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { PaymentController } from '@/api/controllers/payment.controller'
import {
  PaymentSchema,
  CreatePaymentSchema,
  PaymentResultSchema,
  PaymentQuerySchema,
  PaymentStatisticsSchema,
  SuccessResponseSchema,
  ErrorSchema
} from '../schemas'

export const createPaymentOpenAPIRoutes = (controller: PaymentController) => {
  const app = new OpenAPIHono()

  // Process Payment
  const createRoute_payment = createRoute({
    method: 'post',
    path: '/',
    tags: ['Payments'],
    summary: 'Process a payment',
    description: 'Process a payment for an invoice. Automatically creates payment record, updates invoice, and generates receipt. Supports partial payments and detects overpayments.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreatePaymentSchema
          }
        }
      }
    },
    responses: {
      201: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(PaymentResultSchema)
          }
        },
        description: 'Payment processed successfully'
      },
      400: {
        content: {
          'application/json': {
            schema: ErrorSchema
          }
        },
        description: 'Invalid input or invoice already paid'
      },
      404: {
        content: {
          'application/json': {
            schema: ErrorSchema
          }
        },
        description: 'Invoice not found'
      }
    }
  })

  // Get All Payments
  const getAllRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Payments'],
    summary: 'Get all payments',
    description: 'Retrieve all payments with optional filters',
    request: {
      query: PaymentQuerySchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(z.array(PaymentSchema))
          }
        },
        description: 'Payments retrieved successfully'
      }
    }
  })

  // Get Payment by ID
  const getByIdRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Payments'],
    summary: 'Get payment by ID',
    description: 'Retrieve a specific payment',
    request: {
      params: z.object({
        id: z.string().uuid()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(PaymentSchema)
          }
        },
        description: 'Payment retrieved successfully'
      },
      404: {
        content: {
          'application/json': {
            schema: ErrorSchema
          }
        },
        description: 'Payment not found'
      }
    }
  })

  // Get Payments by Invoice
  const getByInvoiceRoute = createRoute({
    method: 'get',
    path: '/invoice/{invoiceId}',
    tags: ['Payments'],
    summary: 'Get payments by invoice',
    description: 'Retrieve all payments for a specific invoice',
    request: {
      params: z.object({
        invoiceId: z.string().uuid()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(z.array(PaymentSchema))
          }
        },
        description: 'Payments retrieved successfully'
      }
    }
  })

  // Get Payment Statistics
  const getStatisticsRoute = createRoute({
    method: 'get',
    path: '/statistics',
    tags: ['Payments'],
    summary: 'Get payment statistics',
    description: 'Retrieve payment statistics',
    request: {
      query: z.object({
        invoiceId: z.string().optional()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(PaymentStatisticsSchema)
          }
        },
        description: 'Statistics retrieved successfully'
      }
    }
  })

  // Register routes
  app.openapi(getStatisticsRoute, controller.getStatistics)
  app.openapi(getByInvoiceRoute, controller.getByInvoiceId)
  app.openapi(createRoute_payment, controller.create)
  app.openapi(getAllRoute, controller.getAll)
  app.openapi(getByIdRoute, controller.getById)

  return app
}
