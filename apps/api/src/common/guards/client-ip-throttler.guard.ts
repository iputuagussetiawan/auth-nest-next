import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

import { getClientIp } from '../helpers/client-ip'

/** Rate-limits per visitor rather than per proxy, so web app users don't share one bucket. */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        return getClientIp(req as any) ?? 'unknown'
    }
}
