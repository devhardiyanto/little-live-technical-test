import type { Context, Next } from 'hono'

export const logger = async (c: Context, next: Next) => {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path

  await next()

  const status = c.res.status
  const duration = Date.now() - start

  // Color codes for terminal output
  const statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m'
  const resetColor = '\x1b[0m'

  console.log(
    `${method} ${path} ${statusColor}${status}${resetColor} - ${duration}ms`
  )
}
