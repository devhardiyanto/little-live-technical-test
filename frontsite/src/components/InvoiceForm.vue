<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { formatCurrency } from '@/lib/utils'
import { DEFAULT_TAX_RATE, DEFAULT_TAX_RATE_PERCENT } from '@/lib/constants'
import { toast } from 'vue-sonner'
import type { CreateInvoiceDTO, Invoice } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Props {
  invoice?: Invoice | null
  isEditing?: boolean
}

interface Emits {
  (e: 'saved', invoice: Invoice): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  invoice: null,
  isEditing: false
})

const emit = defineEmits<Emits>()

const paymentStore = usePaymentStore()
const loading = ref(false)

// Form data
const form = ref<CreateInvoiceDTO>({
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  customerName: '',
  customerEmail: '',
  items: [],
  notes: ''
})

// Computed
const totals = computed(() => {
  const subtotal = form.value.items.reduce((sum, item) => {
    return sum + (item.lineTotal || 0)
  }, 0)

  const tax = subtotal * DEFAULT_TAX_RATE
  const total = subtotal + tax

  return { subtotal, tax, total }
})

const isFormValid = computed(() => {
  return form.value.items.length > 0 &&
    form.value.items.every(item =>
      item.description.trim() &&
      item.quantity > 0 &&
      item.unitPrice > 0
    )
})

// Methods
const addItem = () => {
  form.value.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: DEFAULT_TAX_RATE
  })
}

const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}

const calculateItemTotal = (index: number) => {
  const item = form.value.items[index]
  if (item) {
    const lineTotal = (item.quantity || 0) * (item.unitPrice || 0)
    item.lineTotal = lineTotal
  }
}

const saveInvoice = async () => {
  if (!isFormValid.value) {
    toast.error('Please fill in all required fields')
    return
  }

  loading.value = true
  try {
    let result: Invoice | null

    if (props.isEditing && props.invoice) {
      result = await paymentStore.updateInvoice(props.invoice.id, form.value)
      toast.success('Invoice updated successfully')
    } else {
      result = await paymentStore.createInvoice(form.value)
      toast.success('Invoice created successfully')
    }

    if (result) {
      emit('saved', result)
    }
  } catch (error: any) {
    toast.error(error?.message || 'Failed to save invoice')
  } finally {
    loading.value = false
  }
}

// Initialize form with existing invoice data
const initializeForm = () => {
  if (props.invoice && props.isEditing) {
    form.value = {
      invoiceNumber: props.invoice.invoiceNumber,
      invoiceDate: props.invoice.invoiceDate.split('T')[0],
      customerName: props.invoice.customerName || '',
      customerEmail: props.invoice.customerEmail || '',
      items: props.invoice.items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        lineTotal: item.lineTotal
      })) || [],
      notes: props.invoice.notes || ''
    }
  } else {
    // Add default item for new invoices
    addItem()
  }
}

// Watch for prop changes
watch(() => props.invoice, initializeForm, { immediate: true })

// Calculate totals when items change
watch(() => form.value.items, () => {
  form.value.items.forEach((_, index) => calculateItemTotal(index))
}, { deep: true })

onMounted(() => {
  initializeForm()
})
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>
          {{ isEditing ? 'Edit Invoice' : 'Create New Invoice' }}
        </CardTitle>
        <div class="flex space-x-3">
          <Button
            @click="saveInvoice"
            :disabled="loading || !isFormValid"
            variant="default"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Saving...' : 'Save Invoice' }}
          </Button>
          <Button
            @click="$emit('cancel')"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="saveInvoice" class="space-y-6">
        <!-- Invoice Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label class="mb-2" for="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              v-model="form.invoiceNumber"
              placeholder="Auto-generated if empty"
            />
          </div>
          <div class="space-y-2">
            <Label class="mb-2" for="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              v-model="form.invoiceDate"
              type="date"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label class="mb-2" for="customerName">Customer Name</Label>
            <Input
              id="customerName"
              v-model="form.customerName"
              placeholder="Enter customer name"
            />
          </div>
          <div class="space-y-2">
            <Label class="mb-2" for="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              v-model="form.customerEmail"
              type="email"
              placeholder="customer@example.com"
            />
          </div>
        </div>

        <Separator />

        <!-- Line Items -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-md font-medium text-gray-900">Line Items</h4>
            <Button
              @click="addItem"
              type="button"
              variant="secondary"
              size="sm"
            >
              <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </Button>
          </div>

          <div class="overflow-x-auto rounded-md border">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(item, index) in form.items" :key="index">
                  <td class="px-3 py-3 whitespace-nowrap">
                    <Input
                      v-model="item.description"
                      placeholder="Item description"
                      @input="calculateItemTotal(index)"
                    />
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <Input
                      v-model.number="item.quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-20"
                      @input="calculateItemTotal(index)"
                    />
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="text-gray-500 mr-1">$</span>
                      <Input
                        v-model.number="item.unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-24"
                        @input="calculateItemTotal(index)"
                      />
                    </div>
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${{ formatCurrency(item.lineTotal || 0) }}
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <Button
                      @click="removeItem(index)"
                      type="button"
                      variant="ghost"
                      size="sm"
                    >
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="form.items.length === 0" class="text-center py-8 text-gray-500">
            No items added yet. Click "Add Item" to get started.
          </div>
        </div>

        <Separator />

        <!-- Totals -->
        <Card class="bg-gray-50">
          <CardContent class="pt-6">
            <div class="flex justify-end">
              <div class="w-64 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-medium">${{ formatCurrency(totals.subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Tax ({{ DEFAULT_TAX_RATE_PERCENT }}% GST):</span>
                  <span class="font-medium">${{ formatCurrency(totals.tax) }}</span>
                </div>
                <Separator />
                <div class="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${{ formatCurrency(totals.total) }}</span>
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
            placeholder="Additional notes or comments..."
          ></textarea>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

