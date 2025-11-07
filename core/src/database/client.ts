import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/config/env.config'
import * as schema from './schema'

// Create PostgreSQL connection
const client = postgres(env.DATABASE_URL)

// Create Drizzle instance
export const db = drizzle(client, { schema })

// Export for type inference
export type Database = typeof db
