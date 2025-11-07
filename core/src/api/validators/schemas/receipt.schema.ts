import { z } from 'zod'

// Query Filters Schema
export const receiptFiltersSchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional()
})

export type ReceiptFiltersSchema = z.infer<typeof receiptFiltersSchema>
