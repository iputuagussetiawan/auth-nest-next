import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20'

import { AuthService } from '../auth.service'
import { OAuthCookieStateStore } from './oauth-state.store'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            scope: ['profile', 'email'],
            store: new OAuthCookieStateStore(),
        } as StrategyOptions)
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
        const { id, name, emails, photos } = profile
        // Accounts are matched by email, so only trust addresses Google has verified
        if (!emails?.[0]?.value || !emails[0].verified) {
            throw new UnauthorizedException('Google account email is not verified')
        }
        return this.authService.loginOrCreateAccount({
            provider: 'google',
            providerId: id,
            firstName: name?.givenName || '',
            lastName: name?.familyName || '',
            email: emails?.[0]?.value,
            picture: photos?.[0]?.value,
        })
    }
}
