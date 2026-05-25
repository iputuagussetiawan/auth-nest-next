import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

export const DRIZZLE = Symbol('DRIZZLE')

export const DrizzleProvider = {
    provide: DRIZZLE,
    useFactory: () => {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ...(process.env.NODE_ENV === 'production' && { ssl: { rejectUnauthorized: true } }),
        })
        return drizzle(pool, { schema })
    },
}
