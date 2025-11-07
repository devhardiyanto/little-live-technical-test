<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { storeToRefs } from 'pinia'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass } from '@/lib/utils'
import type { Invoice, PaymentResult } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import InvoiceForm from './InvoiceForm.vue'
import PaymentForm from './PaymentForm.vue'

const paymentStore = usePaymentStore()
const { invoices, loading } = storeToRefs(paymentStore)

const filters = ref({
  status: '',
})

const showFormDialog = ref(false)
const showPaymentDialog = ref(false)
const showViewDialog = ref(false)
const selectedInvoice = ref<Invoice | null>(null)
const isEditing = ref(false)

const applyFilters = async () => {
  await paymentStore.fetchInvoices({
    status: filters.value.status || undefined,
  })
}

const resetFilters = async () => {
  filters.value.status = ''
  await paymentStore.fetchInvoices()
}

const openCreateDialog = () => {
  selectedInvoice.value = null
  isEditing.value = false
  showFormDialog.value = true
}

const viewInvoice = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  showViewDialog.value = true
}

const editInvoice = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  isEditing.value = true
  showFormDialog.value = true
}

const payInvoice = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  showPaymentDialog.value = true
}

const deleteInvoice = async (invoice: Invoice) => {
  if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
    await paymentStore.deleteInvoice(invoice.id)
  }
}

const handleInvoiceSaved = async () => {
  closeFormDialog()
  await paymentStore.fetchInvoices()
}

const handlePaymentSuccess = async (result: PaymentResult) => {
  closePaymentDialog()
  await paymentStore.fetchInvoices()
}

const closeFormDialog = () => {
  showFormDialog.value = false
  selectedInvoice.value = null
  isEditing.value = false
}

const closePaymentDialog = () => {
  showPaymentDialog.value = false
  selectedInvoice.value = null
}

const closeViewDialog = () => {
  showViewDialog.value = false
  selectedInvoice.value = null
}

onMounted(async () => {
  await paymentStore.fetchInvoices()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Actions -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button @click="openCreateDialog" variant="default">
            <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Invoice
          </Button>
        </div>
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
              <option value="overdue">Overdue</option>
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
        <div v-else-if="invoices.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
          <div class="mt-6">
            <Button @click="openCreateDialog">
              <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Invoice
            </Button>
          </div>
        </div>

        <!-- Invoice Table -->
        <div v-else class="overflow-hidden rounded-md border">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ invoice.invoiceNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ invoice.customerName || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(invoice.invoiceDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ formatCurrency(invoice.totalAmount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="invoice.outstandingAmount > 0 ? 'text-yellow-600' : 'text-green-600'">
                  ${{ formatCurrency(invoice.outstandingAmount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(invoice.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ formatStatus(invoice.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-2">
                    <Button @click="viewInvoice(invoice)" variant="ghost" size="sm">
                      View
                    </Button>
                    <Button
                      @click="editInvoice(invoice)"
                      variant="ghost"
                      size="sm"
                      v-if="invoice.status !== 'paid'"
                    >
                      Edit
                    </Button>
                    <Button
                      @click="payInvoice(invoice)"
                      variant="ghost"
                      size="sm"
                      v-if="invoice.outstandingAmount > 0"
                      class="text-green-600 hover:text-green-700"
                    >
                      Pay
                    </Button>
                    <Button
                      @click="deleteInvoice(invoice)"
                      variant="ghost"
                      size="sm"
                      class="text-red-600 hover:text-red-700"
                      v-if="invoice.status === 'draft'"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Invoice Dialog -->
    <Dialog :open="showFormDialog" @update:open="showFormDialog = $event">
      <DialogContent class="w-full max-w-6xl! max-h-[90vh] overflow-y-auto">
        <InvoiceForm
          :invoice="selectedInvoice"
          :is-editing="isEditing"
          @saved="handleInvoiceSaved"
          @cancel="closeFormDialog"
        />
      </DialogContent>
    </Dialog>

    <!-- Pay Invoice Dialog -->
    <Dialog :open="showPaymentDialog" @update:open="showPaymentDialog = $event">
      <DialogContent class="max-w-4xl! max-h-[90vh] overflow-y-auto">
        <PaymentForm
          v-if="selectedInvoice"
          :invoice="selectedInvoice"
          @success="handlePaymentSuccess"
          @cancel="closePaymentDialog"
        />
      </DialogContent>
    </Dialog>

    <!-- View Invoice Dialog -->
    <Dialog :open="showViewDialog" @update:open="showViewDialog = $event">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details - {{ selectedInvoice?.invoiceNumber }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-6 mt-4">
          <!-- Customer Info -->
          <div>
            <h3 class="text-lg font-medium mb-3">Customer Information</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Name:</span>
                <div class="font-medium">{{ selectedInvoice?.customerName || 'N/A' }}</div>
              </div>
              <div>
                <span class="text-gray-600">Email:</span>
                <div class="font-medium">{{ selectedInvoice?.customerEmail || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <Separator />

          <!-- Items -->
          <div>
            <h3 class="text-lg font-medium mb-3">Items</h3>
            <div class="overflow-hidden rounded-md border">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Price</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in selectedInvoice?.items" :key="item.id">
                    <td class="px-4 py-2 text-sm">{{ item.description }}</td>
                    <td class="px-4 py-2 text-sm">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-sm">${{ formatCurrency(item.unitPrice) }}</td>
                    <td class="px-4 py-2 text-sm font-medium">${{ formatCurrency(item.lineTotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          <!-- Totals -->
          <div class="flex justify-end">
            <div class="w-64 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">${{ formatCurrency(selectedInvoice?.subtotal || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tax:</span>
                <span class="font-medium">${{ formatCurrency(selectedInvoice?.totalTax || 0) }}</span>
              </div>
              <Separator />
              <div class="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${{ formatCurrency(selectedInvoice?.totalAmount || 0) }}</span>
              </div>
              <div class="flex justify-between text-lg font-semibold text-yellow-600">
                <span>Outstanding:</span>
                <span>${{ formatCurrency(selectedInvoice?.outstandingAmount || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button @click="closeViewDialog" variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
