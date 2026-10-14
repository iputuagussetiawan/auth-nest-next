import { Body, Controller, Get, Module, Post, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { IsEmail } from 'class-validator'

import { HttpExceptionFilter } from '../common/filters/http-exception.filter'

class TestRequestDto {
    @IsEmail()
    email!: string
}

@Controller('integration')
class IntegrationController {
    @Post('validation')
    validation(@Body() _dto: TestRequestDto) {
        return { status: 'success' }
    }

    @Get('failure')
    failure(): never {
        throw new Error('private database details')
    }
}

@Module({ controllers: [IntegrationController] })
class IntegrationModule {}

describe('API integration behavior', () => {
    let app: Awaited<ReturnType<typeof NestFactory.create>>
    let baseUrl: string

    beforeAll(async () => {
        app = await NestFactory.create(IntegrationModule, { logger: false })
        app.setGlobalPrefix('api')
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        app.useGlobalFilters(new HttpExceptionFilter())
        await app.listen(0)
        baseUrl = await app.getUrl()
    })

    afterAll(async () => {
        await app.close()
    })

    it('accepts a valid payload', async () => {
        const response = await fetch(`${baseUrl}/api/integration/validation`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: 'user@example.com' }),
        })
        const body = await response.json()

        expect(response.status).toBe(201)
        expect(body).toEqual({ status: 'success' })
    })

    it('returns a safe validation error envelope for an invalid payload', async () => {
        const response = await fetch(`${baseUrl}/api/integration/validation`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: 'invalid' }),
        })
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body).toEqual(
            expect.objectContaining({
                status: 'error',
                data: null,
                requestId: expect.any(String),
            }),
        )
    })

    it('rejects unknown fields', async () => {
        const response = await fetch(`${baseUrl}/api/integration/validation`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: 'user@example.com', extra: 'nope' }),
        })

        expect(response.status).toBe(400)
    })

    it('returns a generic 500 without leaking internal details', async () => {
        const response = await fetch(`${baseUrl}/api/integration/failure`)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body).toEqual(
            expect.objectContaining({
                status: 'error',
                message: 'Internal server error',
                data: null,
                requestId: expect.any(String),
            }),
        )
        expect(JSON.stringify(body)).not.toContain('private database details')
        expect(response.headers.get('x-request-id')).toBe(body.requestId)
    })
})
