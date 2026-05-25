import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'

import { verifyEmailTemplate, passwordResetTemplate } from './templates'

@Injectable()
export class MailService {
    private resend: Resend

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY)
    }

    async sendVerificationEmail(to: string, url: string): Promise<void> {
        const { subject, html } = verifyEmailTemplate(url)
        await this.resend.emails.send({
            from: process.env.MAIL_FROM || 'noreply@example.com',
            to,
            subject,
            html,
        })
    }

    async sendPasswordResetEmail(to: string, url: string): Promise<void> {
        const { subject, html } = passwordResetTemplate(url)
        await this.resend.emails.send({
            from: process.env.MAIL_FROM || 'noreply@example.com',
            to,
            subject,
            html,
        })
    }
}
