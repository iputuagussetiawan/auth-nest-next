import { HttpException, HttpStatus } from '@nestjs/common'

export class BadRequestException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.BAD_REQUEST)
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.NOT_FOUND)
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.UNAUTHORIZED)
    }
}

export class TooManyRequestsException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.TOO_MANY_REQUESTS)
    }
}

export class ForbiddenException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.FORBIDDEN)
    }
}
