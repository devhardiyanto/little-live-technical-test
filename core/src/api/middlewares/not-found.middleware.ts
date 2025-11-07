import type { Context } from 'hono'
import { ApiResponse } from '@/shared/utils/response.util'

export const notFound = (c: Context) => {
  return c.json(
    ApiResponse.error(`Route ${c.req.method} ${c.req.path} not found`),
    404
  )
}
