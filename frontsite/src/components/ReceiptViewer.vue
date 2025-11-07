<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Payment Receipt</CardTitle>
        <div class="flex space-x-3">
          <Button
            @click="printReceipt"
            variant="outline"
            size="sm"
          >
            <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </Button>
          <Button
            @click="downloadReceipt"
            variant="outline"
            size="sm"
          >
            <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <!-- Receipt Content -->
      <div ref="receiptContent" class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">PAYMENT RECEIPT</h1>
          <div class="text-sm text-gray-600 space-y-1">
            <div>Receipt No: <span class="font-medium">{{ receipt?.receiptNumber }}</span></div>
            <div>Date: <span class="font-medium">{{ formatDate(receipt?.receiptDate) }}</span></div>
            <div v-if="receipt?.payment">Payment Ref: <span class="font-medium">{{ receipt.payment.referenceNumber }}</span></div>
          </div>
        </div>

        <Separator class="mb-6" />

        <!-- Invoice Details -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Invoice Details</h3>
          <Card class="bg-gray-50">
            <CardContent class="pt-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Invoice Number:</span>
                  <div class="font-medium">{{ receipt?.invoice?.invoiceNumber }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Invoice Date:</span>
                  <div class="font-medium">{{ formatDate(receipt?.invoice?.invoiceDate) }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Customer:</span>
                  <div class="font-medium">{{ receipt?.invoice?.customerName || 'N/A' }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Invoice Amount:</span>
                  <div class="font-medium">${{ formatCurrency(receipt?.invoice?.totalAmount || 0) }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Payment Details -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
          <Card class="bg-gray-50">
            <CardContent class="pt-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Payment Method:</span>
                  <div class="font-medium">{{ formatPaymentMethod(receipt?.paymentMethod) }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Amount Paid:</span>
                  <div class="font-medium text-green-600 text-lg">${{ formatCurrency(receipt?.totalPaid || 0) }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Payment Date:</span>
                  <div class="font-medium">{{ formatDate(receipt?.receiptDate) }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Remaining Balance:</span>
                  <div :class="[
                    'font-medium text-lg',
                    (receipt?.remainingBalance || 0) > 0 ? 'text-yellow-600' : 'text-green-600'
                  ]">
                    ${{ formatCurrency(receipt?.remainingBalance || 0) }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator class="mb-6" />

        <!-- Item Breakdown -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Item Breakdown</h3>
          <div class="overflow-hidden border border-gray-200 rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in receipt?.items || []" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.description }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.quantity }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ formatCurrency(item.unitPrice) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ formatCurrency(item.lineTotal) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${{ formatCurrency(item.paidAmount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Separator class="mb-6" />

        <!-- Totals -->
        <Card class="bg-gray-50">
          <CardContent class="pt-6">
            <div class="flex justify-end">
              <div class="w-64 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-medium">${{ formatCurrency(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Tax ({{ DEFAULT_TAX_RATE_PERCENT }}% GST):</span>
                  <span class="font-medium">${{ formatCurrency(totalTax) }}</span>
                </div>
                <Separator />
                <div class="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${{ formatCurrency(receipt?.invoice?.totalAmount || 0) }}</span>
                </div>
                <div class="flex justify-between text-lg font-semibold text-green-600">
                  <span>Amount Paid:</span>
                  <span>${{ formatCurrency(receipt?.totalPaid || 0) }}</span>
                </div>
                <div v-if="(receipt?.remainingBalance || 0) > 0" class="flex justify-between text-lg font-semibold text-yellow-600">
                  <span>Remaining Balance:</span>
                  <span>${{ formatCurrency(receipt?.remainingBalance || 0) }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Notes -->
        <div v-if="receipt?.notes" class="mt-6">
          <Separator class="mb-4" />
          <h4 class="text-sm font-medium text-gray-900 mb-2">Notes:</h4>
          <p class="text-sm text-gray-600">{{ receipt.notes }}</p>
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Thank you for your payment!</p>
          <p class="mt-1">Generated on {{ formatDateTime(new Date()) }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatCurrency, formatDate, formatDateTime, formatPaymentMethod } from '@/lib/utils'
import { DEFAULT_TAX_RATE_PERCENT } from '@/lib/constants'
import { toast } from 'vue-sonner'
import type { Receipt } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Props {
  receipt: Receipt | null
}

const props = defineProps<Props>()

const receiptContent = ref<HTMLElement>()

// Computed
const subtotal = computed(() => {
  return props.receipt?.items?.reduce((sum, item) => sum + item.lineTotal, 0) || 0
})

const totalTax = computed(() => {
  return props.receipt?.items?.reduce((sum, item) => sum + item.taxAmount, 0) || 0
})

// Methods
const printReceipt = () => {
  if (receiptContent.value) {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${props.receipt?.receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt { max-width: 600px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .mb-4 { margin-bottom: 16px; }
              .mt-4 { margin-top: 16px; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${receiptContent.value.innerHTML}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      toast.success('Print dialog opened')
    } else {
      toast.error('Failed to open print window')
    }
  }
}

const downloadReceipt = () => {
  // In a real application, this would generate a PDF
  // For now, we'll just trigger the print dialog
  toast.info('PDF download will be implemented soon')
  printReceipt()
}
</script>
