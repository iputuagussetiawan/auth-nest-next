import { BadRequestException } from '@nestjs/common'

const startsWith = (buf: Buffer, bytes: number[], offset = 0) =>
    buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b)

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0))

// Anything that can run when an SVG is opened directly rather than through <img>
const SVG_ACTIVE_CONTENT = /<script|<foreignObject|javascript:|\son[a-z]+\s*=/i

/** The image type the bytes actually contain, ignoring the client-supplied Content-Type */
export function detectImageType(buf: Buffer): string | null {
    if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'image/jpeg'
    if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
    if (startsWith(buf, ascii('GIF87a')) || startsWith(buf, ascii('GIF89a'))) return 'image/gif'
    if (startsWith(buf, ascii('RIFF')) && startsWith(buf, ascii('WEBP'), 8)) return 'image/webp'
    if (startsWith(buf, [0x00, 0x00, 0x01, 0x00])) return 'image/x-icon'

    const head = buf
        .subarray(0, 1024)
        .toString('utf8')
        .replace(/^\uFEFF/, '')
        .trimStart()
    if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) {
        return 'image/svg+xml'
    }
    return null
}

/**
 * Multer's fileFilter only sees the Content-Type the client claims. Check the real bytes before
 * anything is uploaded, and refuse SVGs carrying scripts or event handlers.
 */
export function assertImageContent(file: Express.Multer.File, allowed: string[]) {
    const type = detectImageType(file.buffer)
    // The two ICO media types describe the same format
    const normalized = (t: string) => (t === 'image/vnd.microsoft.icon' ? 'image/x-icon' : t)
    if (!type || !allowed.map(normalized).includes(type)) {
        throw new BadRequestException('File content is not an allowed image type')
    }
    if (type === 'image/svg+xml' && SVG_ACTIVE_CONTENT.test(file.buffer.toString('utf8'))) {
        throw new BadRequestException('SVG files must not contain scripts or event handlers')
    }
}
