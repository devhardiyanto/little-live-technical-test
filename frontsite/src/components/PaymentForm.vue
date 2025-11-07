<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'vue-sonner'
import type { CreatePaymentDTO, Invoice, PaymentResult } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  invoice: Invoice
}

interface Emits {
  (e: 'success', result: PaymentResult): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const paymentStore = usePaymentStore()
const loading = ref(false)

// Form data
const form = ref<CreatePaymentDTO>({
  invoiceId: props.invoice.id,
  paymentMethod: 'cash',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  referenceNumber: '',
  notes: ''
})

// Payment result preview
const paymentResult = ref({
  remainingBalance: props.invoice.outstandingAmount,
  isFullyPaid: false,
  isOverpayment: false,
  overpaymentAmount: 0
})

// Computed
const isFormValid = computed(() => {
  return form.value.paymentMethod &&
    form.value.amount > 0
})

// Methods
const calculatePaymentResult = () => {
  const amount = form.value.amount || 0
  const outstanding = props.invoice.outstandingAmount
  const remainingBalance = outstanding - amount

  paymentResult.value = {
    remainingBalance,
    isFullyPaid: remainingBalance === 0,
    isOverpayment: remainingBalance < 0,
    overpaymentAmount: remainingBalance < 0 ? Math.abs(remainingBalance) : 0
  }
}

const setFullAmount = () => {
  form.value.amount = props.invoice.outstandingAmount
  calculatePaymentResult()
}

const setPartialAmount = () => {
  form.value.amount = Math.round(props.invoice.outstandingAmount / 2 * 100) / 100
  calculatePaymentResult()
}

const processPayment = async () => {
  if (!isFormValid.value) {
    toast.error('Please fill in all required fields')
    return
  }

  loading.value = true
  try {
    const result = await paymentStore.processPayment(form.value)
    if (result) {
      toast.success('Payment processed successfully!')
      emit('success', result)
    }
  } catch (error: any) {
    toast.error(error?.message || 'Failed to process payment')
  } finally {
    loading.value = false
  }
}

// Watch for amount changes
watch(() => form.value.amount, calculatePaymentResult)

onMounted(() => {
  calculatePaymentResult()
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        Process Payment - Invoice {{ invoice?.invoiceNumber }}
      </CardTitle>
    </CardHeader>

    <CardContent>
      <!-- Invoice Summary -->
      <Card v-if="invoice" class="bg-gray-50 mb-6">
        <CardContent class="pt-6">
          <h4 class="text-md font-medium text-gray-900 mb-3">Invoice Summary</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Invoice:</span>
              <div class="font-medium">{{ invoice.invoiceNumber }}</div>
            </div>
            <div>
              <span class="text-gray-500">Total Amount:</span>
              <div class="font-medium">${{ formatCurrency(invoice.totalAmount) }}</div>
            </div>
            <div>
              <span class="text-gray-500">Outstanding:</span>
              <div class="font-medium text-yellow-600">${{ formatCurrency(invoice.outstandingAmount) }}</div>
            </div>
            <div>
              <span class="text-gray-500">Previous Payments:</span>
              <div class="font-medium">${{ formatCurrency(invoice.totalAmount - invoice.outstandingAmount) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form @submit.prevent="processPayment" class="space-y-6">
        <!-- Payment Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label class="mb-2" for="paymentMethod">Payment Method</Label>
            <Select v-model="form.paymentMethod">
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label class="mb-2" for="amount">Payment Amount</Label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                id="amount"
                v-model.number="form.amount"
                type="number"
                min="0"
                step="0.01"
                class="pl-7"
                placeholder="0.00"
                required
                @input="calculatePaymentResult"
              />
            </div>
            <div class="flex space-x-2 text-xs">
              <Button
                @click="setFullAmount"
                type="button"
                variant="link"
                size="sm"
                class="h-auto p-0"
              >
                Pay Full Amount
              </Button>
              <span class="text-gray-300">|</span>
              <Button
                @click="setPartialAmount"
                type="button"
                variant="link"
                size="sm"
                class="h-auto p-0"
              >
                Pay Half
              </Button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label class="mb-2" for="referenceNumber">Reference Number</Label>
            <Input
              id="referenceNumber"
              v-model="form.referenceNumber"
              placeholder="Auto-generated if empty"
            />
          </div>
          <div class="space-y-2">
            <Label class="mb-2" for="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              v-model="form.paymentDate"
              type="date"
            />
          </div>
        </div>

        <Separator />

        <!-- Payment Result Preview -->
        <Card v-if="form.amount > 0" class="bg-blue-50 border-blue-200">
          <CardContent class="pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-3">After Payment:</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Remaining Balance:</span>
                <div :class="[
                  'font-medium text-lg',
                  paymentResult.remainingBalance < 0 ? 'text-red-600' : 'text-green-600'
                ]">
                  ${{ formatCurrency(Math.abs(paymentResult.remainingBalance)) }}
                  <span v-if="paymentResult.remainingBalance < 0" class="text-xs">(Overpayment)</span>
                </div>
              </div>
              <div>
                <span class="text-gray-600">Status:</span>
                <div class="font-medium">
                  <span v-if="paymentResult.isFullyPaid" class="text-green-600">✓ Fully Paid</span>
                  <span v-else-if="paymentResult.isOverpayment" class="text-red-600">⚠ Overpayment</span>
                  <span v-else class="text-yellow-600">⊙ Partially Paid</span>
                </div>
              </div>
              <div v-if="paymentResult.isOverpayment">
                <span class="text-gray-600">Overpayment Amount:</span>
                <div class="font-medium text-red-600 text-lg">
                  ${{ formatCurrency(paymentResult.overpaymentAmount) }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Overpayment Warning -->
        <Card v-if="paymentResult.isOverpayment" class="bg-yellow-50 border-yellow-200">
          <CardContent class="pt-6">
            <div class="flex">
              <div class="shrink-0">
                <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Overpayment Detected</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>The payment amount exceeds the outstanding balance by ${{ formatCurrency(paymentResult.overpaymentAmount) }}. This will result in a credit balance.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Notes -->
        <div class="space-y-2">
          <Label class="mb-2" for="notes">Notes</Label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="3"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Additional notes about this payment..."
          ></textarea>
        </div>

        <Separator />

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <Button
            @click="$emit('cancel')"
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="loading || !isFormValid"
            variant="default"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Processing...' : 'Process Payment' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
