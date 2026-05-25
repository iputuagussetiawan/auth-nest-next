import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { AppModule } from './app.module'

async function bootstrap() {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set')
    }

    const app = await NestFactory.create(AppModule)

    app.use(helmet())
    app.use(cookieParser())

    app.getHttpAdapter().getInstance().set('trust proxy', 1)

    app.setGlobalPrefix('api')

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    const origin = process.env.FRONTEND_ORIGIN
    if (!origin && process.env.NODE_ENV === 'production') {
        throw new Error('FRONTEND_ORIGIN must be set in production')
    }

    app.enableCors({
        origin: origin || 'http://localhost:3000',
        credentials: true,
    })

    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('AI Finance API v2')
            .setDescription('REST API for AI Finance application')
            .setVersion('2.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
            .addCookieAuth('accessToken')
            .build()

        const document = SwaggerModule.createDocument(app, config)
        SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        })
    }

    const port = process.env.PORT || 4001
    await app.listen(port)
    console.log(`api-v2 running on http://localhost:${port}/api`)
}

bootstrap()
