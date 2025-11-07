<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Payment System</h1>
            <div class="hidden sm:flex space-x-2">
              <Button
                @click="activeTab = 'dashboard'"
                :variant="activeTab === 'dashboard' ? 'default' : 'ghost'"
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                @click="activeTab = 'invoices'"
                :variant="activeTab === 'invoices' ? 'default' : 'ghost'"
                size="sm"
              >
                Invoices
              </Button>
              <Button
                @click="activeTab = 'payments'"
                :variant="activeTab === 'payments' ? 'default' : 'ghost'"
                size="sm"
              >
                Payments
              </Button>
              <Button
                @click="activeTab = 'receipts'"
                :variant="activeTab === 'receipts' ? 'default' : 'ghost'"
                size="sm"
              >
                Receipts
              </Button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">Welcome back!</span>
            <Button variant="destructive" size="sm">Logout</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div class="flex items-center">
                <div class="shrink-0">
                  <div class="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                    <dd class="text-2xl font-bold text-gray-900">
                      ${{ formatCurrency(dashboardStats?.totalInvoices.amount || 0) }}
                    </dd>
                    <dd class="text-sm text-gray-500">{{ dashboardStats?.totalInvoices.count || 0 }} invoices</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div class="flex items-center">
                <div class="shrink-0">
                  <div class="w-12 h-12 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Outstanding Amount</dt>
                    <dd class="text-2xl font-bold text-gray-900">
                      ${{ formatCurrency(dashboardStats?.outstandingAmount.amount || 0) }}
                    </dd>
                    <dd class="text-sm text-gray-500">{{ dashboardStats?.outstandingAmount.count || 0 }} pending</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div class="flex items-center">
                <div class="shrink-0">
                  <div class="w-12 h-12 bg-green-500 rounded-md flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Paid Today</dt>
                    <dd class="text-2xl font-bold text-gray-900">
                      ${{ formatCurrency(dashboardStats?.paidToday.amount || 0) }}
                    </dd>
                    <dd class="text-sm text-gray-500">{{ dashboardStats?.paidToday.count || 0 }} payments</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Recent Transactions -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button
                @click="activeTab = 'invoices'"
                variant="link"
                size="sm"
              >
                View All
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <div v-else-if="invoices.length === 0" class="text-center py-8 text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="mt-2">No transactions yet</p>
            </div>

            <div v-else class="overflow-hidden rounded-md border">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="invoice in invoices.slice(0, 5)" :key="invoice.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ invoice.invoiceNumber }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ invoice.items?.[0]?.description || 'No description' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${{ formatCurrency(invoice.totalAmount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusBadgeClass(invoice.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ formatStatus(invoice.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(invoice.invoiceDate) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Invoices Tab -->
      <InvoiceList v-else-if="activeTab === 'invoices'" />

      <!-- Payments Tab -->
      <PaymentList v-else-if="activeTab === 'payments'" />

      <!-- Receipts Tab -->
      <ReceiptList v-else-if="activeTab === 'receipts'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { storeToRefs } from 'pinia'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InvoiceList from '@/components/InvoiceList.vue'
import PaymentList from '@/components/PaymentList.vue'
import ReceiptList from '@/components/ReceiptList.vue'

const paymentStore = usePaymentStore()
const { invoices, dashboardStats, loading } = storeToRefs(paymentStore)

const activeTab = ref('dashboard')

// Load data on mount
onMounted(async () => {
  await Promise.all([
    paymentStore.fetchDashboardStats(),
    paymentStore.fetchInvoices({ limit: 5 })
  ])
})
</script>
