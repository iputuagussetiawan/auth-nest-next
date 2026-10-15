import { BadRequestException } from '@nestjs/common'

import { assertImageContent, detectImageType } from './image-content'

const file = (content: Buffer | string) =>
    ({ buffer: Buffer.isBuffer(content) ? content : Buffer.from(content) }) as Express.Multer.File

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0])
const WEBP = Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('WEBPVP8 '),
])
const ICO = Buffer.from([0, 0, 1, 0, 1, 0])

describe('detectImageType', () => {
    it.each([
        [PNG, 'image/png'],
        [JPEG, 'image/jpeg'],
        [Buffer.from('GIF89a....'), 'image/gif'],
        [WEBP, 'image/webp'],
        [ICO, 'image/x-icon'],
        [Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'image/svg+xml'],
        [Buffer.from('<?xml version="1.0"?>\n<svg viewBox="0 0 1 1"/>'), 'image/svg+xml'],
    ])('recognises %#', (buf, type) => {
        expect(detectImageType(buf)).toBe(type)
    })

    it('returns null for content that is not an image', () => {
        expect(detectImageType(Buffer.from('<html><script>alert(1)</script>'))).toBeNull()
        expect(detectImageType(Buffer.from('MZ\x90\x00'))).toBeNull()
        expect(detectImageType(Buffer.alloc(0))).toBeNull()
    })
})

describe('assertImageContent', () => {
    const RASTER = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const SITE = [...RASTER, 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']

    it('accepts an allowed image regardless of what the client claimed', () => {
        expect(() => assertImageContent(file(PNG), RASTER)).not.toThrow()
    })

    it('rejects a non-image disguised with an image Content-Type', () => {
        expect(() => assertImageContent(file('<html>hi</html>'), RASTER)).toThrow(
            BadRequestException,
        )
    })

    it('rejects a real image of a type this endpoint does not allow', () => {
        expect(() => assertImageContent(file('<svg></svg>'), RASTER)).toThrow(BadRequestException)
        expect(() => assertImageContent(file(ICO), RASTER)).toThrow(BadRequestException)
    })

    it('accepts a plain SVG and an ICO where the endpoint allows them', () => {
        expect(() =>
            assertImageContent(file('<svg><path d="M0 0h1v1z"/></svg>'), SITE),
        ).not.toThrow()
        expect(() => assertImageContent(file(ICO), SITE)).not.toThrow()
    })

    it.each([
        '<svg><script>alert(1)</script></svg>',
        '<svg onload="alert(1)"></svg>',
        '<svg><a href="javascript:alert(1)"><path/></a></svg>',
        '<svg><foreignObject><div/></foreignObject></svg>',
    ])('rejects an SVG with active content: %s', (svg) => {
        expect(() => assertImageContent(file(svg), SITE)).toThrow(BadRequestException)
    })
})
