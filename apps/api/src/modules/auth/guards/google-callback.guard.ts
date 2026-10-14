import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

export type GoogleAuthErrorReason = 'signup_closed' | 'email_unverified' | 'error'

export function googleAuthErrorReason(err: unknown): GoogleAuthErrorReason {
    if (!(err instanceof HttpException)) return 'error'
    // AuthService throws 503 when signup is closed; GoogleStrategy throws 401 for unverified emails
    if (err.getStatus() === HttpStatus.SERVICE_UNAVAILABLE) return 'signup_closed'
    if (err.getStatus() === HttpStatus.UNAUTHORIZED) return 'email_unverified'
    return 'error'
}

/**
 * The OAuth callback is a browser redirect, so a thrown error would leave the user on a
 * JSON page. Record the reason instead and let the controller redirect back to sign in.
 */
@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
    handleRequest<TUser>(err: unknown, user: TUser, _info: unknown, context: ExecutionContext) {
        if (err || !user) {
            const req = context.switchToHttp().getRequest()
            req.googleAuthError = err ? googleAuthErrorReason(err) : 'error'
            return null as TUser
        }
        return user
    }
}
