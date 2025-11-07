import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from '@/config/env.config'
import { db } from '@/database/client'

// Repositories
import { InvoiceRepositoryImpl } from '@/repositories/invoice.repository.impl'
import { PaymentRepositoryImpl } from '@/repositories/payment.repository.impl'
import { ReceiptRepositoryImpl } from '@/repositories/receipt.repository.impl'

// Services
import { InvoiceService } from '@/services/invoice.service'
import { PaymentService } from '@/services/payment.service'
import { ReceiptService } from '@/services/receipt.service'

// Controllers
import { InvoiceController } from '@/api/controllers/invoice.controller'
import { PaymentController } from '@/api/controllers/payment.controller'
import { ReceiptController } from '@/api/controllers/receipt.controller'

// Routes
import { createV1Routes } from '@/api/routes/v1'
import { createOpenAPIApp } from '@/api/openapi'
import { swaggerUI } from '@hono/swagger-ui'

// Middlewares
import { logger } from '@/api/middlewares/logger.middleware'
import { errorHandler } from '@/api/middlewares/error.middleware'
import { notFound } from '@/api/middlewares/not-found.middleware'

// ============================================
// Dependency Injection Setup
// ============================================

// Repositories
const invoiceRepository = new InvoiceRepositoryImpl(db)
const paymentRepository = new PaymentRepositoryImpl(db)
const receiptRepository = new ReceiptRepositoryImpl(db)

// Services
const invoiceService = new InvoiceService(invoiceRepository)
const paymentService = new PaymentService(
  paymentRepository,
  invoiceRepository,
  receiptRepository
)
const receiptService = new ReceiptService(receiptRepository)

// Controllers
const invoiceController = new InvoiceController(invoiceService)
const paymentController = new PaymentController(paymentService)
const receiptController = new ReceiptController(receiptService)

// ============================================
// Application Setup
// ============================================

const app = new Hono()

// Global Middlewares
app.use('*', logger)
app.use('*', cors())

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Payment System API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    documentation: {
      swagger: '/swagger',
      openapi: '/api/v1/openapi.json',
      interactive: '/api/docs'
    },
    endpoints: {
      health: '/api/v1/health',
      invoices: '/api/v1/invoices',
      payments: '/api/v1/payments',
      receipts: '/api/v1/receipts'
    }
  })
})

// Swagger UI - Must be at root level
app.get(
  '/swagger',
  swaggerUI({
    url: '/api/v1/openapi.json'
  })
)

// API Routes - OpenAPI with documentation
app.route('/api/v1', createOpenAPIApp(invoiceController, paymentController, receiptController))

// API Routes - Legacy (without OpenAPI)
// Uncomment if you want to use both OpenAPI and regular routes
// app.route('/api/v1/legacy', createV1Routes(invoiceController, paymentController, receiptController))

// 404 Handler
app.notFound(notFound)

// Global Error Handler
app.onError(errorHandler)

// ============================================
// Server Start
// ============================================

console.log('🚀 Starting Payment System API...')
console.log(`📦 Environment: ${env.NODE_ENV}`)
console.log(`🗄️  Database: Connected`)

serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`)
  console.log(`\n📚 Documentation:`)
  console.log(`   Swagger UI: http://localhost:${info.port}/swagger`)
  console.log(`   OpenAPI Spec: http://localhost:${info.port}/api/v1/openapi.json`)
  console.log(`   Interactive Docs: http://localhost:${info.port}/api/docs`)
  console.log(`\n🌐 API Endpoints:`)
  console.log(`   Health Check: http://localhost:${info.port}/api/v1/health`)
  console.log(`   💰 Invoices: http://localhost:${info.port}/api/v1/invoices`)
  console.log(`   💳 Payments: http://localhost:${info.port}/api/v1/payments`)
  console.log(`   🧾 Receipts: http://localhost:${info.port}/api/v1/receipts`)
  console.log(`\n🎯 Ready to accept requests!`)
})
