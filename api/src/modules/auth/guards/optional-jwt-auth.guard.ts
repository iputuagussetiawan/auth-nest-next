import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            await super.canActivate(context)
        } catch {
            // no token or invalid token — proceed without user
        }
        return true
    }

    handleRequest(_err: any, user: any) {
        return user || null
    }
}
