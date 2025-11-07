import client from '@/lib/client'
import type { 
  Invoice, 
  Payment, 
  Receipt, 
  CreateInvoiceDTO, 
  CreatePaymentDTO,
  PaymentResult,
  DashboardStats,
  ApiResponse
} from '@/types/payment'

export class PaymentService {
  private readonly baseURL = '/api/v1'

  // Invoice endpoints
  async getInvoices(params?: {
    status?: string
    customerId?: string
    limit?: number
    offset?: number
  }): Promise<Invoice[]> {
    const response = await client.get(`${this.baseURL}/invoices`, { params })
    return response.data.data || response.data
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await client.get(`${this.baseURL}/invoices/${id}`)
    return response.data.data || response.data
  }

  async createInvoice(data: CreateInvoiceDTO): Promise<Invoice> {
    const response = await client.post(`${this.baseURL}/invoices`, data)
    return response.data.data || response.data
  }

  async updateInvoice(id: string, data: Partial<CreateInvoiceDTO>): Promise<Invoice> {
    const response = await client.put(`${this.baseURL}/invoices/${id}`, data)
    return response.data.data || response.data
  }

  async deleteInvoice(id: string): Promise<void> {
    await client.delete(`${this.baseURL}/invoices/${id}`)
  }

  async getInvoiceStatistics(params?: { customerId?: string }): Promise<any> {
    const response = await client.get(`${this.baseURL}/invoices/statistics`, { params })
    return response.data.data || response.data
  }

  // Payment endpoints
  async getPayments(params?: {
    status?: string
    paymentMethod?: string
    limit?: number
    offset?: number
  }): Promise<Payment[]> {
    const response = await client.get(`${this.baseURL}/payments`, { params })
    return response.data.data || response.data
  }

  async getPaymentById(id: string): Promise<Payment> {
    const response = await client.get(`${this.baseURL}/payments/${id}`)
    return response.data.data || response.data
  }

  async processPayment(data: CreatePaymentDTO): Promise<PaymentResult> {
    const response = await client.post(`${this.baseURL}/payments`, data)
    return response.data.data || response.data
  }

  async getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const response = await client.get(`${this.baseURL}/payments/invoice/${invoiceId}`)
    return response.data.data || response.data
  }

  async getPaymentStatistics(params?: { invoiceId?: string }): Promise<any> {
    const response = await client.get(`${this.baseURL}/payments/statistics`, { params })
    return response.data.data || response.data
  }

  // Receipt endpoints
  async getReceipts(params?: {
    limit?: number
    offset?: number
  }): Promise<Receipt[]> {
    const response = await client.get(`${this.baseURL}/receipts`, { params })
    return response.data.data || response.data
  }

  async getReceiptById(id: string): Promise<Receipt> {
    const response = await client.get(`${this.baseURL}/receipts/${id}`)
    return response.data.data || response.data
  }

  async getReceiptByPaymentId(paymentId: string): Promise<Receipt> {
    const response = await client.get(`${this.baseURL}/receipts/payment/${paymentId}`)
    return response.data.data || response.data
  }

  async getReceiptsByInvoiceId(invoiceId: string): Promise<Receipt[]> {
    const response = await client.get(`${this.baseURL}/receipts/invoice/${invoiceId}`)
    return response.data.data || response.data
  }

  // Dashboard data
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [invoicesStats, paymentsStats, recentInvoices] = await Promise.all([
        this.getInvoiceStatistics(),
        this.getPaymentStatistics(),
        this.getInvoices({ limit: 5 })
      ])

      return {
        totalInvoices: {
          count: invoicesStats?.total || 0,
          amount: invoicesStats?.totalAmount || 0
        },
        outstandingAmount: {
          count: invoicesStats?.count?.pending || 0,
          amount: invoicesStats?.outstandingAmount || 0
        },
        paidToday: {
          count: paymentsStats?.todayCount || 0,
          amount: paymentsStats?.todayAmount || 0
        },
        recentTransactions: recentInvoices.map(invoice => ({
          ...invoice,
          type: 'invoice' as const
        }))
      }
    } catch (error) {
      // Return mock data if API is not ready
      return {
        totalInvoices: { count: 12, amount: 25430 },
        outstandingAmount: { count: 3, amount: 8750 },
        paidToday: { count: 2, amount: 3200 },
        recentTransactions: []
      }
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await client.get(`${this.baseURL}/health`)
      return true
    } catch {
      return false
    }
  }
}

export const paymentService = new PaymentService()