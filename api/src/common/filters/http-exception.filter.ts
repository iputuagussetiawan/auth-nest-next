import { randomUUID } from 'crypto'
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)

    catch(exception: unknown, host: ArgumentsHost) {
        const http = host.switchToHttp()
        const request = http.getRequest<Request>()
        const response = http.getResponse<Response>()
        const requestId = randomUUID()
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR
        const publicMessage =
            exception instanceof HttpException
                ? this.getMessage(exception.getResponse())
                : 'Internal server error'

        response.setHeader('X-Request-Id', requestId)
        response.status(status).json({
            status: 'error',
            message: publicMessage,
            data: null,
            requestId,
        })

        const method = request?.method ?? 'UNKNOWN'
        const url = request?.originalUrl ?? request?.url ?? 'UNKNOWN'
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`${method} ${url} ${status} requestId=${requestId}`, exception)
        } else {
            this.logger.warn(`${method} ${url} ${status} requestId=${requestId}`)
        }
    }

    private getMessage(response: string | object) {
        if (typeof response === 'string') return response
        if (Array.isArray(response)) return response.join(', ')
        if ('message' in response) {
            const message = response.message
            return Array.isArray(message) ? message.join(', ') : String(message)
        }
        return 'Request failed'
    }
}
