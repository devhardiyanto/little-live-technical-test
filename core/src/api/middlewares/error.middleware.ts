import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { NotFoundException, ValidationException } from '@/core/exceptions'
import { ZodError } from 'zod'
import { ApiResponse } from '@/shared/utils/response.util'

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err)

  // Zod Validation Errors
  if (err instanceof ZodError) {
    return c.json(
      ApiResponse.error('Validation failed', {
        issues: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }),
      400
    )
  }

  // Custom Exceptions
  if (err instanceof ValidationException) {
    return c.json(
      ApiResponse.error(err.message),
      err.statusCode
    )
  }

  if (err instanceof NotFoundException) {
    return c.json(
      ApiResponse.error(err.message),
      err.statusCode
    )
  }

  // Hono HTTP Exception
  if (err instanceof HTTPException) {
    return c.json(
      ApiResponse.error(err.message),
      err.status
    )
  }

  // Database Errors
  if (err.message.includes('duplicate key')) {
    return c.json(
      ApiResponse.error('Resource already exists'),
      409
    )
  }

  if (err.message.includes('foreign key constraint')) {
    return c.json(
      ApiResponse.error('Cannot delete resource with existing references'),
      409
    )
  }

  // Generic Server Error
  return c.json(
    ApiResponse.error(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    ),
    500
  )
}
