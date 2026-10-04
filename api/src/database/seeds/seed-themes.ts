import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '../schema'
import { runThemeSeed } from './theme.seed'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

async function main() {
    // inserts missing presets only; existing themes and the active theme are left untouched.
    await runThemeSeed(db)
    console.log('\nDone.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => pool.end())
