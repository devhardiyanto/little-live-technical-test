<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/utils'
import type { Receipt } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import ReceiptViewer from './ReceiptViewer.vue'

const paymentStore = usePaymentStore()

const receipts = ref<Receipt[]>([])
const loading = ref(false)
const showReceiptDialog = ref(false)
const selectedReceipt = ref<Receipt | null>(null)

const fetchReceipts = async () => {
  loading.value = true
  try {
    // Fetch all payments first, then get their receipts
    await paymentStore.fetchPayments()
    const allReceipts: Receipt[] = []

    for (const payment of paymentStore.payments) {
      try {
        const receipt = await paymentStore.fetchReceiptByPaymentId(payment.id)
        if (receipt) {
          allReceipts.push(receipt)
        }
      } catch (error) {
        // Skip if receipt not found
        console.warn(`Receipt not found for payment ${payment.id}`)
      }
    }

    receipts.value = allReceipts
  } catch (error) {
    console.error('Failed to fetch receipts:', error)
  } finally {
    loading.value = false
  }
}

const viewReceipt = (receipt: Receipt) => {
  selectedReceipt.value = receipt
  showReceiptDialog.value = true
}

onMounted(async () => {
  await fetchReceipts()
})
</script>


<template>
  <div class="space-y-6">
    <!-- Header -->
    <Card>
      <CardHeader>
        <CardTitle>Receipts</CardTitle>
      </CardHeader>

      <CardContent>
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="receipts.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
          <p class="mt-1 text-sm text-gray-500">Receipts will appear here after payments are processed.</p>
        </div>

        <!-- Receipt Table -->
        <div v-else class="overflow-hidden rounded-md border">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="receipt in receipts" :key="receipt.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ receipt.receiptNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(receipt.receiptDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatPaymentMethod(receipt.paymentMethod) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  ${{ formatCurrency(receipt.totalPaid) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="receipt.remainingBalance > 0 ? 'text-yellow-600' : 'text-green-600'">
                  ${{ formatCurrency(receipt.remainingBalance) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="receipt.remainingBalance === 0" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Fully Paid
                  </span>
                  <span v-else-if="receipt.remainingBalance < 0" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Overpaid
                  </span>
                  <span v-else class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Partial
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <Button @click="viewReceipt(receipt)" variant="ghost" size="sm">
                    View Details
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- View Receipt Dialog -->
    <Dialog :open="showReceiptDialog" @update:open="showReceiptDialog = $event">
      <DialogContent class="max-w-4xl! max-h-[90vh] overflow-y-auto">
        <ReceiptViewer v-if="selectedReceipt" :receipt="selectedReceipt" />
      </DialogContent>
    </Dialog>
  </div>
</template>