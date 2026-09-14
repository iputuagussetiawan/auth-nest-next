import 'dotenv/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../schema'
import { runRoleSeed } from './role.seed'
import { runUserSeed } from './user.seed'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

async function main() {
    // roles must exist first so user_roles FKs resolve; runRoleSeed is idempotent.
    const roleMap = await runRoleSeed(db)
    await runUserSeed(db, roleMap)
    console.log('\nDone.')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => pool.end())
