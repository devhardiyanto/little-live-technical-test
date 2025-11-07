/**
 * API Documentation Data
 * This can be served via /api/docs endpoint
 */

export const apiDocs = {
  info: {
    title: 'Payment System API',
    version: '1.0.0',
    description: 'Complete billing and payment processing system with invoice management, payment processing, and receipt generation.',
    contact: {
      name: 'API Support',
      url: 'https://github.com/your-repo'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server'
    }
  ],
  endpoints: {
    invoices: {
      title: 'Invoice Management',
      description: 'Create, read, update, and delete invoices',
      endpoints: [
        {
          method: 'POST',
          path: '/invoices',
          description: 'Create a new invoice',
          body: {
            customerName: 'string (optional)',
            customerEmail: 'string (optional)',
            dueDate: 'ISO datetime (optional)',
            items: [
              {
                description: 'string (required)',
                quantity: 'number (required)',
                unitPrice: 'number (required)',
                taxRate: 'number (optional, default: 0.07)'
              }
            ],
            notes: 'string (optional)'
          },
          example: {
            request: {
              customerName: 'John Doe',
              customerEmail: 'john@example.com',
              items: [
                {
                  description: 'Monthly Fee',
                  quantity: 1,
                  unitPrice: 500.00
                }
              ]
            },
            response: {
              success: true,
              message: 'Invoice created successfully',
              data: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                invoiceNumber: 'INV-20251107-1234',
                totalAmount: 535.00,
                status: 'pending'
              }
            }
          }
        },
        {
          method: 'GET',
          path: '/invoices',
          description: 'Get all invoices',
          queryParams: {
            status: 'string (optional)',
            customerId: 'string (optional)',
            limit: 'number (optional, default: 100)',
            offset: 'number (optional, default: 0)'
          }
        },
        {
          method: 'GET',
          path: '/invoices/:id',
          description: 'Get invoice by ID'
        },
        {
          method: 'GET',
          path: '/invoices/number/:invoiceNumber',
          description: 'Get invoice by number'
        },
        {
          method: 'PUT',
          path: '/invoices/:id',
          description: 'Update invoice'
        },
        {
          method: 'DELETE',
          path: '/invoices/:id',
          description: 'Delete invoice'
        },
        {
          method: 'GET',
          path: '/invoices/statistics',
          description: 'Get invoice statistics'
        }
      ]
    },
    payments: {
      title: 'Payment Processing',
      description: 'Process payments and manage payment records',
      endpoints: [
        {
          method: 'POST',
          path: '/payments',
          description: 'Process a payment (creates payment + receipt automatically)',
          body: {
            invoiceId: 'UUID (required)',
            amount: 'number (required)',
            paymentMethod: 'enum (required): cash | bank_transfer | credit_card | debit_card | e_wallet',
            referenceNumber: 'string (optional, auto-generated)',
            notes: 'string (optional)'
          },
          example: {
            request: {
              invoiceId: '550e8400-e29b-41d4-a716-446655440000',
              amount: 300.00,
              paymentMethod: 'bank_transfer'
            },
            response: {
              success: true,
              message: 'Payment processed successfully. Remaining balance: $289.57',
              data: {
                payment: {
                  id: 'payment-id',
                  amount: 300.00,
                  status: 'completed'
                },
                invoice: {
                  outstandingAmount: 289.57,
                  status: 'partially_paid'
                },
                receipt: {
                  receiptNumber: 'RCP-1699357800000-1234',
                  totalPaid: 300.00
                },
                isFullyPaid: false,
                isOverpayment: false,
                overpaymentAmount: 0
              }
            }
          }
        },
        {
          method: 'GET',
          path: '/payments',
          description: 'Get all payments',
          queryParams: {
            status: 'string (optional)',
            paymentMethod: 'string (optional)',
            limit: 'number (optional)',
            offset: 'number (optional)'
          }
        },
        {
          method: 'GET',
          path: '/payments/:id',
          description: 'Get payment by ID'
        },
        {
          method: 'GET',
          path: '/payments/reference/:referenceNumber',
          description: 'Get payment by reference number'
        },
        {
          method: 'GET',
          path: '/payments/invoice/:invoiceId',
          description: 'Get all payments for an invoice'
        },
        {
          method: 'GET',
          path: '/payments/statistics',
          description: 'Get payment statistics'
        }
      ]
    },
    receipts: {
      title: 'Receipt Management',
      description: 'View and manage payment receipts',
      endpoints: [
        {
          method: 'GET',
          path: '/receipts',
          description: 'Get all receipts',
          queryParams: {
            limit: 'number (optional)',
            offset: 'number (optional)'
          }
        },
        {
          method: 'GET',
          path: '/receipts/:id',
          description: 'Get receipt by ID'
        },
        {
          method: 'GET',
          path: '/receipts/payment/:paymentId',
          description: 'Get receipt by payment ID'
        },
        {
          method: 'GET',
          path: '/receipts/number/:receiptNumber',
          description: 'Get receipt by number'
        },
        {
          method: 'GET',
          path: '/receipts/invoice/:invoiceId',
          description: 'Get all receipts for an invoice'
        }
      ]
    }
  },
  testScenarios: [
    {
      name: 'Basic Invoice Calculation',
      description: 'Create invoice and verify tax calculation',
      steps: [
        {
          step: 1,
          action: 'POST /invoices',
          data: {
            items: [
              { description: 'Monthly Fee', quantity: 1, unitPrice: 500.00 },
              { description: 'Service Fee', quantity: 2, unitPrice: 25.50 }
            ]
          },
          expected: {
            subtotal: 551.00,
            tax: 38.57,
            total: 589.57
          }
        }
      ]
    },
    {
      name: 'Partial Payment Flow',
      description: 'Test multiple payments on single invoice',
      steps: [
        {
          step: 1,
          action: 'Create invoice',
          expected: 'Invoice with total $589.57'
        },
        {
          step: 2,
          action: 'POST /payments with $300',
          expected: 'Outstanding: $289.57, Status: partially_paid'
        },
        {
          step: 3,
          action: 'POST /payments with $750',
          expected: 'Outstanding: $0, Status: paid, Overpayment: $460.43'
        }
      ]
    },
    {
      name: 'Edge Cases',
      description: 'Test validation and error handling',
      cases: [
        {
          test: 'Zero amount payment',
          expected: '400 Bad Request'
        },
        {
          test: 'Negative unit price',
          expected: '400 Bad Request'
        },
        {
          test: 'Very large amount (> 999,999,999.99)',
          expected: '400 Bad Request'
        },
        {
          test: 'Payment on fully paid invoice',
          expected: '400 Bad Request'
        }
      ]
    }
  ],
  errorCodes: {
    400: 'Bad Request - Invalid input or business logic error',
    404: 'Not Found - Resource not found',
    500: 'Internal Server Error - Server error'
  },
  features: [
    'Invoice Management with automatic calculations',
    'Multiple payment methods support',
    'Partial payment handling',
    'Overpayment detection and tracking',
    'Automatic receipt generation',
    'Payment history tracking',
    '7% GST tax calculation',
    'Invoice status management'
  ]
}
