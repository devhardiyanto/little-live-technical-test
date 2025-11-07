import { db } from '@/database/client'
import { invoices, invoiceItems, payments, receipts, receiptItems } from '@/database/schema'
import { InvoiceService } from '@/services/invoice.service'
import { PaymentService } from '@/services/payment.service'
import { InvoiceRepositoryImpl } from '@/repositories/invoice.repository.impl'
import { PaymentRepositoryImpl } from '@/repositories/payment.repository.impl'
import { ReceiptRepositoryImpl } from '@/repositories/receipt.repository.impl'

async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...')
    await db.delete(receiptItems)
    await db.delete(receipts)
    await db.delete(payments)
    await db.delete(invoiceItems)
    await db.delete(invoices)
    console.log('✅ Data cleaned')

    // Initialize repositories and services
    const invoiceRepo = new InvoiceRepositoryImpl(db)
    const paymentRepo = new PaymentRepositoryImpl(db)
    const receiptRepo = new ReceiptRepositoryImpl(db)

    const invoiceService = new InvoiceService(invoiceRepo)
    const paymentService = new PaymentService(paymentRepo, invoiceRepo, receiptRepo)

    // ============================================
    // Seed Invoice 1: Fully Paid
    // ============================================
    console.log('\n📄 Creating Invoice 1 (Fully Paid)...')
    const invoice1 = await invoiceService.createInvoice({
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      items: [
        {
          description: 'Monthly Subscription Fee',
          quantity: 1,
          unitPrice: 500.00,
          taxRate: 0.07
        },
        {
          description: 'Setup Fee',
          quantity: 1,
          unitPrice: 100.00,
          taxRate: 0.07
        }
      ],
      notes: 'Monthly billing - January 2025'
    })
    console.log(`✅ Invoice created: ${invoice1.invoiceNumber}`)
    console.log(`   Total: $${invoice1.totalAmount}`)

    // Pay invoice 1 fully
    console.log('💳 Processing full payment...')
    const payment1 = await paymentService.processInvoicePayment({
      invoiceId: invoice1.id,
      amount: invoice1.totalAmount,
      paymentMethod: 'bank_transfer',
      notes: 'Full payment via bank transfer'
    })
    console.log(`✅ Payment processed: ${payment1.payment.referenceNumber}`)
    console.log(`   Status: ${payment1.invoice.status}`)

    // ============================================
    // Seed Invoice 2: Partially Paid
    // ============================================
    console.log('\n📄 Creating Invoice 2 (Partially Paid)...')
    const invoice2 = await invoiceService.createInvoice({
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      items: [
        {
          description: 'Professional Service Fee',
          quantity: 10,
          unitPrice: 150.00,
          taxRate: 0.07
        },
        {
          description: 'Consultation Fee',
          quantity: 2,
          unitPrice: 200.00,
          taxRate: 0.07
        }
      ],
      notes: 'Professional services - Q1 2025'
    })
    console.log(`✅ Invoice created: ${invoice2.invoiceNumber}`)
    console.log(`   Total: $${invoice2.totalAmount}`)

    // Partial payment 1
    console.log('💳 Processing partial payment 1...')
    const payment2a = await paymentService.processInvoicePayment({
      invoiceId: invoice2.id,
      amount: 1000.00,
      paymentMethod: 'cash',
      notes: 'Partial payment - first installment'
    })
    console.log(`✅ Payment processed: ${payment2a.payment.referenceNumber}`)
    console.log(`   Outstanding: $${payment2a.invoice.outstandingAmount}`)

    // Partial payment 2
    console.log('💳 Processing partial payment 2...')
    const payment2b = await paymentService.processInvoicePayment({
      invoiceId: invoice2.id,
      amount: 500.00,
      paymentMethod: 'credit_card',
      notes: 'Partial payment - second installment'
    })
    console.log(`✅ Payment processed: ${payment2b.payment.referenceNumber}`)
    console.log(`   Outstanding: $${payment2b.invoice.outstandingAmount}`)
    console.log(`   Status: ${payment2b.invoice.status}`)

    // ============================================
    // Seed Invoice 3: Pending (Unpaid)
    // ============================================
    console.log('\n📄 Creating Invoice 3 (Pending/Unpaid)...')
    const invoice3 = await invoiceService.createInvoice({
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.com',
      items: [
        {
          description: 'Annual License Fee',
          quantity: 5,
          unitPrice: 1200.00,
          taxRate: 0.07
        },
        {
          description: 'Support Package',
          quantity: 1,
          unitPrice: 500.00,
          taxRate: 0.07
        }
      ],
      notes: 'Annual billing - 2025'
    })
    console.log(`✅ Invoice created: ${invoice3.invoiceNumber}`)
    console.log(`   Total: $${invoice3.totalAmount}`)
    console.log(`   Status: ${invoice3.status} (no payment yet)`)

    // ============================================
    // Seed Invoice 4: Overpayment Scenario
    // ============================================
    console.log('\n📄 Creating Invoice 4 (Overpayment)...')
    const invoice4 = await invoiceService.createInvoice({
      customerName: 'Tech Startup Inc',
      customerEmail: 'accounts@techstartup.io',
      items: [
        {
          description: 'Web Development Service',
          quantity: 1,
          unitPrice: 750.00,
          taxRate: 0.07
        }
      ],
      notes: 'Website development project'
    })
    console.log(`✅ Invoice created: ${invoice4.invoiceNumber}`)
    console.log(`   Total: $${invoice4.totalAmount}`)

    // Overpayment
    console.log('💳 Processing overpayment...')
    const payment4 = await paymentService.processInvoicePayment({
      invoiceId: invoice4.id,
      amount: 1000.00,
      paymentMethod: 'bank_transfer',
      notes: 'Payment with tip/extra amount'
    })
    console.log(`✅ Payment processed: ${payment4.payment.referenceNumber}`)
    console.log(`   Overpayment: $${payment4.overpaymentAmount}`)
    console.log(`   Status: ${payment4.invoice.status}`)

    // ============================================
    // Seed Invoice 5: Multiple Small Items
    // ============================================
    console.log('\n📄 Creating Invoice 5 (Multiple Items)...')
    const invoice5 = await invoiceService.createInvoice({
      customerName: 'Small Business LLC',
      customerEmail: 'owner@smallbiz.com',
      items: [
        {
          description: 'Domain Registration',
          quantity: 1,
          unitPrice: 15.00,
          taxRate: 0.07
        },
        {
          description: 'Web Hosting - 1 Year',
          quantity: 1,
          unitPrice: 120.00,
          taxRate: 0.07
        },
        {
          description: 'SSL Certificate',
          quantity: 1,
          unitPrice: 50.00,
          taxRate: 0.07
        },
        {
          description: 'Email Hosting',
          quantity: 5,
          unitPrice: 5.00,
          taxRate: 0.07
        }
      ],
      notes: 'Website setup package'
    })
    console.log(`✅ Invoice created: ${invoice5.invoiceNumber}`)
    console.log(`   Total: $${invoice5.totalAmount}`)
    console.log(`   Items: ${invoice5.items.length}`)

    // Partial payment
    console.log('💳 Processing partial payment...')
    const payment5 = await paymentService.processInvoicePayment({
      invoiceId: invoice5.id,
      amount: 100.00,
      paymentMethod: 'e_wallet',
      notes: 'Partial payment via e-wallet'
    })
    console.log(`✅ Payment processed: ${payment5.payment.referenceNumber}`)
    console.log(`   Outstanding: $${payment5.invoice.outstandingAmount}`)

    // ============================================
    // Summary
    // ============================================
    console.log('\n' + '='.repeat(50))
    console.log('📊 SEEDING SUMMARY')
    console.log('='.repeat(50))

    const allInvoices = await invoiceService.getAllInvoices()
    const allPayments = await paymentService.getAllPayments()

    console.log(`\n✅ Created ${allInvoices.length} invoices:`)
    allInvoices.forEach((inv, i) => {
      console.log(`   ${i + 1}. ${inv.invoiceNumber} - ${inv.customerName}`)
      console.log(`      Total: $${inv.totalAmount} | Outstanding: $${inv.outstandingAmount} | Status: ${inv.status}`)
    })

    console.log(`\n✅ Created ${allPayments.length} payments:`)
    allPayments.forEach((pay, i) => {
      console.log(`   ${i + 1}. ${pay.referenceNumber} - $${pay.amount} (${pay.paymentMethod})`)
    })

    const stats = await invoiceService.getStatistics()
    console.log('\n📈 Invoice Statistics:')
    console.log(`   Total Invoices: ${stats.total}`)
    console.log(`   Pending: ${stats.pending}`)
    console.log(`   Partially Paid: ${stats.partiallyPaid}`)
    console.log(`   Paid: ${stats.paid}`)
    console.log(`   Total Amount: $${stats.totalAmount}`)
    console.log(`   Outstanding: $${stats.totalOutstanding}`)

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Database seeding completed successfully!')
    console.log('='.repeat(50))
    console.log('\n📚 Next steps:')
    console.log('   1. Start server: npm run dev')
    console.log('   2. Open Swagger: http://localhost:3000/api/docs')
    console.log('   3. Test the seeded data!')
    console.log('')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

// Run seed
seed()
