import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { paymentService } from '@/services/payment.service'
import type { 
  Invoice, 
  Payment, 
  Receipt, 
  CreateInvoiceDTO, 
  CreatePaymentDTO,
  DashboardStats 
} from '@/types/payment'
import { toast } from 'sonner'

export const usePaymentStore = defineStore('payment', () => {
  // State
  const invoices = ref<Invoice[]>([])
  const payments = ref<Payment[]>([])
  const receipts = ref<Receipt[]>([])
  const dashboardStats = ref<DashboardStats | null>(null)
  const currentInvoice = ref<Invoice | null>(null)
  const currentPayment = ref<Payment | null>(null)
  const currentReceipt = ref<Receipt | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const totalInvoices = computed(() => invoices.value.length)
  const pendingInvoices = computed(() => 
    invoices.value.filter(inv => inv.status === 'pending' || inv.status === 'partially_paid')
  )
  const paidInvoices = computed(() => 
    invoices.value.filter(inv => inv.status === 'paid')
  )
  const totalOutstanding = computed(() => 
    invoices.value.reduce((sum, inv) => sum + inv.outstandingAmount, 0)
  )

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
    if (message) {
      toast.error(message)
    }
  }

  // Dashboard actions
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      dashboardStats.value = await paymentService.getDashboardStats()
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  // Invoice actions
  const fetchInvoices = async (params?: {
    status?: string
    customerId?: string
    limit?: number
    offset?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      invoices.value = await paymentService.getInvoices(params)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoiceById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      currentInvoice.value = await paymentService.getInvoiceById(id)
      return currentInvoice.value
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoice')
      return null
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async (data: CreateInvoiceDTO) => {
    try {
      setLoading(true)
      setError(null)
      const newInvoice = await paymentService.createInvoice(data)
      invoices.value.unshift(newInvoice)
      toast.success('Invoice created successfully')
      return newInvoice
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateInvoice = async (id: string, data: Partial<CreateInvoiceDTO>) => {
    try {
      setLoading(true)
      setError(null)
      const updatedInvoice = await paymentService.updateInvoice(id, data)
      const index = invoices.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        invoices.value[index] = updatedInvoice
      }
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = updatedInvoice
      }
      toast.success('Invoice updated successfully')
      return updatedInvoice
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await paymentService.deleteInvoice(id)
      invoices.value = invoices.value.filter(inv => inv.id !== id)
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = null
      }
      toast.success('Invoice deleted successfully')
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete invoice')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Payment actions
  const fetchPayments = async (params?: {
    status?: string
    paymentMethod?: string
    limit?: number
    offset?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      payments.value = await paymentService.getPayments(params)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async (data: CreatePaymentDTO) => {
    try {
      setLoading(true)
      setError(null)
      const result = await paymentService.processPayment(data)
      
      // Update local state
      payments.value.unshift(result.payment)
      
      // Update invoice in local state
      const invoiceIndex = invoices.value.findIndex(inv => inv.id === data.invoiceId)
      if (invoiceIndex !== -1) {
        invoices.value[invoiceIndex] = result.invoice
      }
      
      // Update current invoice if it's the same
      if (currentInvoice.value?.id === data.invoiceId) {
        currentInvoice.value = result.invoice
      }

      // Show appropriate success message
      let message = 'Payment processed successfully'
      if (result.isOverpayment) {
        message += `. Overpayment of $${result.overpaymentAmount.toFixed(2)} detected`
      } else if (result.isFullyPaid) {
        message += '. Invoice is now fully paid'
      } else {
        message += `. Remaining balance: $${result.remainingBalance.toFixed(2)}`
      }
      
      toast.success(message)
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentsByInvoiceId = async (invoiceId: string) => {
    try {
      setLoading(true)
      setError(null)
      return await paymentService.getPaymentsByInvoiceId(invoiceId)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Receipt actions
  const fetchReceiptByPaymentId = async (paymentId: string) => {
    try {
      setLoading(true)
      setError(null)
      currentReceipt.value = await paymentService.getReceiptByPaymentId(paymentId)
      return currentReceipt.value
    } catch (err: any) {
      setError(err.message || 'Failed to fetch receipt')
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchReceiptsByInvoiceId = async (invoiceId: string) => {
    try {
      setLoading(true)
      setError(null)
      return await paymentService.getReceiptsByInvoiceId(invoiceId)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch receipts')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Utility actions
  const clearError = () => {
    error.value = null
  }

  const clearCurrentInvoice = () => {
    currentInvoice.value = null
  }

  const clearCurrentPayment = () => {
    currentPayment.value = null
  }

  const clearCurrentReceipt = () => {
    currentReceipt.value = null
  }

  return {
    // State
    invoices,
    payments,
    receipts,
    dashboardStats,
    currentInvoice,
    currentPayment,
    currentReceipt,
    loading,
    error,
    
    // Computed
    totalInvoices,
    pendingInvoices,
    paidInvoices,
    totalOutstanding,
    
    // Actions
    fetchDashboardStats,
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    fetchPayments,
    processPayment,
    fetchPaymentsByInvoiceId,
    fetchReceiptByPaymentId,
    fetchReceiptsByInvoiceId,
    clearError,
    clearCurrentInvoice,
    clearCurrentPayment,
    clearCurrentReceipt
  }
})
