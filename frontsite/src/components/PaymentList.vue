<template>
  <div class="space-y-6">
    <!-- Header -->
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>

      <CardContent>
        <!-- Filters -->
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex-1 min-w-[200px]">
            <Label class="mb-2" for="statusFilter">Status</Label>
            <select
              id="statusFilter"
              v-model="filters.status"
              @change="applyFilters"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <Label class="mb-2" for="methodFilter">Payment Method</Label>
            <select
              id="methodFilter"
              v-model="filters.paymentMethod"
              @change="applyFilters"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="e_wallet">E-Wallet</option>
            </select>
          </div>
          <div class="flex items-end">
            <Button @click="resetFilters" variant="outline" size="sm">
              Reset Filters
            </Button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="payments.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No payments</h3>
          <p class="mt-1 text-sm text-gray-500">Payments will appear here once invoices are paid.</p>
        </div>

        <!-- Payment Table -->
        <div v-else class="overflow-hidden rounded-md border">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ payment.referenceNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Button @click="viewInvoice(payment.invoiceId)" variant="link" size="sm" class="p-0 h-auto">
                    View Invoice
                  </Button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(payment.paymentDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatPaymentMethod(payment.paymentMethod) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  ${{ formatCurrency(payment.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPaymentStatusClass(payment.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatPaymentStatus(payment.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <Button @click="viewReceipt(payment.id)" variant="ghost" size="sm">
                    View Receipt
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
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <ReceiptViewer v-if="currentReceipt" :receipt="currentReceipt" />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { storeToRefs } from 'pinia'
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/utils'
import { toast } from 'vue-sonner'
import type { Receipt } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import ReceiptViewer from './ReceiptViewer.vue'

const paymentStore = usePaymentStore()
const { payments, loading } = storeToRefs(paymentStore)

const filters = ref({
  status: '',
  paymentMethod: '',
})

const showReceiptDialog = ref(false)
const currentReceipt = ref<Receipt | null>(null)

const formatPaymentStatus = (status: string): string => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getPaymentStatusClass = (status: string): string => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'refunded': 'bg-blue-100 text-blue-800',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const applyFilters = async () => {
  await paymentStore.fetchPayments({
    status: filters.value.status || undefined,
    paymentMethod: filters.value.paymentMethod || undefined,
  })
}

const resetFilters = async () => {
  filters.value.status = ''
  filters.value.paymentMethod = ''
  await paymentStore.fetchPayments()
}

const viewInvoice = async (invoiceId: string) => {
  const invoice = await paymentStore.fetchInvoiceById(invoiceId)
  if (invoice) {
    toast.info('Invoice details loaded')
  }
}

const viewReceipt = async (paymentId: string) => {
  const receipt = await paymentStore.fetchReceiptByPaymentId(paymentId)
  if (receipt) {
    currentReceipt.value = receipt
    showReceiptDialog.value = true
  }
}

onMounted(async () => {
  await paymentStore.fetchPayments()
})
</script>
