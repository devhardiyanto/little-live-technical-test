import { z } from 'zod'
import { config } from 'dotenv'

// Load environment variables
config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url()
})

// Validate and export environment variables
export const env = envSchema.parse(process.env)

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>
