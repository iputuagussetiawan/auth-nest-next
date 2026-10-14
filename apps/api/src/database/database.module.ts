import { Global, Module } from '@nestjs/common'

import { DRIZZLE, DrizzleProvider } from './drizzle.provider'

@Global()
@Module({
    providers: [DrizzleProvider],
    exports: [DRIZZLE],
})
export class DatabaseModule {}
