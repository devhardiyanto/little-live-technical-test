import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { InvoiceController } from '@/api/controllers/invoice.controller'
import {
  InvoiceSchema,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  InvoiceQuerySchema,
  InvoiceStatisticsSchema,
  SuccessResponseSchema,
  ErrorSchema
} from '../schemas'

export const createInvoiceOpenAPIRoutes = (controller: InvoiceController) => {
  const app = new OpenAPIHono()

  // Create Invoice
  const createRoute_invoice = createRoute({
    method: 'post',
    path: '/',
    tags: ['Invoices'],
    summary: 'Create a new invoice',
    description: 'Create a new invoice with line items. Tax is calculated automatically at 7% GST.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateInvoiceSchema
          }
        }
      }
    },
    responses: {
      201: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(InvoiceSchema)
          }
        },
        description: 'Invoice created successfully'
      },
      400: {
        content: {
          'application/json': {
            schema: ErrorSchema
          }
        },
        description: 'Invalid input'
      }
    }
  })

  // Get All Invoices
  const getAllRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Invoices'],
    summary: 'Get all invoices',
    description: 'Retrieve all invoices with optional filters',
    request: {
      query: InvoiceQuerySchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(z.array(InvoiceSchema))
          }
        },
        description: 'Invoices retrieved successfully'
      }
    }
  })

  // Get Invoice by ID
  const getByIdRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Invoices'],
    summary: 'Get invoice by ID',
    description: 'Retrieve a specific invoice with all details',
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' })
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(InvoiceSchema)
          }
        },
        description: 'Invoice retrieved successfully'
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

  // Get Invoice Statistics
  const getStatisticsRoute = createRoute({
    method: 'get',
    path: '/statistics',
    tags: ['Invoices'],
    summary: 'Get invoice statistics',
    description: 'Retrieve invoice statistics with optional customer filter',
    request: {
      query: z.object({
        customerId: z.string().optional()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(InvoiceStatisticsSchema)
          }
        },
        description: 'Statistics retrieved successfully'
      }
    }
  })

  // Update Invoice
  const updateRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Invoices'],
    summary: 'Update invoice',
    description: 'Update invoice details (cannot update if already paid)',
    request: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateInvoiceSchema
          }
        }
      }
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(InvoiceSchema)
          }
        },
        description: 'Invoice updated successfully'
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

  // Delete Invoice
  const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Invoices'],
    summary: 'Delete invoice',
    description: 'Delete an invoice (only if no payments made)',
    request: {
      params: z.object({
        id: z.string().uuid()
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SuccessResponseSchema(z.null())
          }
        },
        description: 'Invoice deleted successfully'
      },
      400: {
        content: {
          'application/json': {
            schema: ErrorSchema
          }
        },
        description: 'Cannot delete invoice with payments'
      }
    }
  })

  // Register routes
  app.openapi(getStatisticsRoute, controller.getStatistics)
  app.openapi(createRoute_invoice, controller.create)
  app.openapi(getAllRoute, controller.getAll)
  app.openapi(getByIdRoute, controller.getById)
  app.openapi(updateRoute, controller.update)
  app.openapi(deleteRoute, controller.delete)

  return app
}
