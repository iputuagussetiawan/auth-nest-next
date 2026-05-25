'use server'

import { sessionService } from '../services/session-service'
import type { ISessionResponse } from '../types/session-type'

export async function handleGetAllSessions() {
    try {
        const response: ISessionResponse = await sessionService.getAll()
        return {
            success: true,
            message: response.message,
            sessions: response.sessions,
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed fetch session',
        }
    }
}
