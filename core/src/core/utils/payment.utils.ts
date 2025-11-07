import {
  Invoice,
  Payment,
  Receipt,
  PaymentResult,
  InvoiceStatus,
  PaymentStatus,
  CreatePaymentInput,
  InvoiceItem,
  ReceiptItem
} from '@/core/types'

/**
 * Process a payment for an invoice
 * Handles partial payments, full payments, and overpayments
 *
 * @param invoice - The invoice to pay
 * @param paymentAmount - The amount being paid
 * @param paymentMethod - The payment method used
 * @returns PaymentResult containing payment, updated invoice, and receipt
 */
export function processPayment(
  invoice: Invoice,
  paymentAmount: number,
  paymentInput: CreatePaymentInput
): {
  payment: Partial<Payment>
  updatedInvoice: Partial<Invoice>
  isFullyPaid: boolean
  isOverpayment: boolean
  overpaymentAmount: number
} {
  // Validate payment amount
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than zero')
  }

  if (paymentAmount > 999999999.99) {
    throw new Error('Payment amount exceeds maximum allowed value')
  }

  // Check if invoice is already fully paid
  if (invoice.outstandingAmount <= 0) {
    throw new Error('Invoice is already fully paid')
  }

  // Check if invoice is cancelled
  if (invoice.status === InvoiceStatus.CANCELLED) {
    throw new Error('Cannot process payment for cancelled invoice')
  }

  // Calculate new outstanding amount
  const newOutstandingAmount = invoice.outstandingAmount - paymentAmount

  // Determine payment status flags
  const isFullyPaid = newOutstandingAmount <= 0
  const isOverpayment = newOutstandingAmount < 0
  const overpaymentAmount = isOverpayment ? Math.abs(newOutstandingAmount) : 0

  // Determine new invoice status
  let newStatus: InvoiceStatus
  if (isFullyPaid) {
    newStatus = InvoiceStatus.PAID
  } else if (newOutstandingAmount < invoice.totalAmount) {
    newStatus = InvoiceStatus.PARTIALLY_PAID
  } else {
    newStatus = invoice.status
  }

  // Create payment object
  const payment: Partial<Payment> = {
    invoiceId: invoice.id,
    paymentMethod: paymentInput.paymentMethod,
    amount: paymentAmount,
    paymentDate: paymentInput.paymentDate || new Date(),
    referenceNumber: paymentInput.referenceNumber || generatePaymentReference(),
    status: PaymentStatus.COMPLETED,
    notes: paymentInput.notes
  }

  // Create updated invoice object
  const updatedInvoice: Partial<Invoice> = {
    outstandingAmount: Math.max(0, newOutstandingAmount),
    status: newStatus,
    updatedAt: new Date()
  }

  return {
    payment,
    updatedInvoice,
    isFullyPaid,
    isOverpayment,
    overpaymentAmount
  }
}

/**
 * Generate receipt from payment and invoice
 *
 * @param payment - The payment made
 * @param invoice - The invoice being paid
 * @returns Receipt object
 */
export function generateReceipt(
  payment: Payment,
  invoice: Invoice
): {
  receipt: Partial<Receipt>
  receiptItems: Partial<ReceiptItem>[]
} {
  // Calculate remaining balance
  const remainingBalance = invoice.outstandingAmount

  // Allocate payment to invoice items proportionally
  const receiptItems: Partial<ReceiptItem>[] = []

  for (const item of invoice.items) {
    const itemTotal = item.lineTotal + item.taxAmount
    const proportion = itemTotal / invoice.totalAmount
    const allocatedAmount = Math.round(payment.amount * proportion * 100) / 100

    receiptItems.push({
      invoiceItemId: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      taxAmount: item.taxAmount,
      paidAmount: allocatedAmount
    })
  }

  // Create receipt object
  const receipt: Partial<Receipt> = {
    paymentId: payment.id,
    invoiceId: invoice.id,
    receiptNumber: generateReceiptNumber(),
    receiptDate: payment.paymentDate,
    totalPaid: payment.amount,
    remainingBalance: remainingBalance,
    paymentMethod: payment.paymentMethod,
    notes: payment.notes
  }

  return {
    receipt,
    receiptItems
  }
}

/**
 * Generate payment reference number
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PAY-${timestamp}-${random}`
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `RCP-${timestamp}-${random}`
}

/**
 * Validate payment amount against invoice
 */
export function validatePaymentAmount(amount: number, invoice: Invoice): void {
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than zero')
  }

  if (amount > 999999999.99) {
    throw new Error('Payment amount exceeds maximum allowed value')
  }

  // Note: We allow overpayments, so we don't restrict amount to outstanding
  // But we can add a warning threshold
  if (amount > invoice.outstandingAmount * 2) {
    console.warn(`Payment amount (${amount}) is significantly larger than outstanding amount (${invoice.outstandingAmount})`)
  }
}
