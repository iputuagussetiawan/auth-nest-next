import { NotFoundException } from '../../common/exceptions/app-error'
import { ThemeService } from './theme.service'

function query(result: unknown[]) {
    return { from: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(result), orderBy: jest.fn().mockResolvedValue(result) }
}
function updateQuery(result: unknown[] = []) {
    return { set: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), returning: jest.fn().mockResolvedValue(result) }
}
function insertQuery(result: unknown[]) {
    return { values: jest.fn().mockReturnThis(), returning: jest.fn().mockResolvedValue(result) }
}

describe('ThemeService', () => {
    it('creates themes and deactivates existing themes when active', async () => {
        const insert = insertQuery([{ id: 'theme-id', name: 'Ocean' }])
        const db = { update: jest.fn().mockReturnValue(updateQuery()), insert: jest.fn().mockReturnValue(insert) }
        const service = new ThemeService(db as never)

        await expect(service.create({ name: 'Ocean', slug: 'ocean', isActive: true, config: {} } as never)).resolves.toEqual({ id: 'theme-id', name: 'Ocean' })
        expect(db.update).toHaveBeenCalled()
        expect(insert.values).toHaveBeenCalledWith({ name: 'Ocean', slug: 'ocean', isActive: true, config: {} })
    })

    it('returns a preferred theme and falls back to active theme', async () => {
        const preferred = { id: 'preferred', isActive: false }
        const active = { id: 'active', isActive: true }
        const db = {
            select: jest.fn()
                .mockReturnValueOnce(query([{ preferredThemeId: 'preferred' }]))
                .mockReturnValueOnce(query([preferred]))
                .mockReturnValueOnce(query([active])),
        }
        const service = new ThemeService(db as never)
        ;(service as any).ensureDefaultTheme = jest.fn().mockResolvedValue(active)

        await expect(service.getMyTheme('user-id')).resolves.toEqual(preferred)
        await expect(service.getMyTheme(null)).resolves.toEqual(active)
    })

    it('sets a valid preference and rejects an unknown theme', async () => {
        const update = updateQuery()
        const db = { select: jest.fn().mockReturnValue(query([{ id: 'theme-id' }])), update: jest.fn().mockReturnValue(update) }
        const service = new ThemeService(db as never)

        await expect(service.setPreference('user-id', 'theme-id')).resolves.toEqual({ themeId: 'theme-id' })
        expect(update.set).toHaveBeenCalledWith(expect.objectContaining({ preferredThemeId: 'theme-id', updatedAt: expect.any(Date) }))

        const missing = new ThemeService({ select: jest.fn().mockReturnValue(query([])) } as never)
        await expect(missing.setPreference('user-id', 'missing')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('activates and updates themes', async () => {
        const existing = { id: 'theme-id', name: 'Old', isActive: false }
        const activated = { ...existing, isActive: true }
        const update = updateQuery([activated])
        const db = { select: jest.fn().mockReturnValue(query([existing])), update: jest.fn().mockReturnValue(update) }
        const service = new ThemeService(db as never)

        await expect(service.activate('theme-id')).resolves.toEqual(activated)
        await expect(service.update('theme-id', { name: 'New' } as never)).resolves.toEqual(activated)
        expect(db.update).toHaveBeenCalled()

        const missing = new ThemeService({ select: jest.fn().mockReturnValue(query([])) } as never)
        await expect(missing.activate('missing')).rejects.toBeInstanceOf(NotFoundException)
        await expect(missing.update('missing', {} as never)).rejects.toBeInstanceOf(NotFoundException)
    })

    it('clears user preferences before deleting a theme', async () => {
        const userUpdate = updateQuery()
        const del = { where: jest.fn().mockResolvedValue(undefined) }
        const db = { select: jest.fn().mockReturnValue(query([{ id: 'theme-id' }])), update: jest.fn().mockReturnValue(userUpdate), delete: jest.fn().mockReturnValue(del) }
        const service = new ThemeService(db as never)

        await expect(service.delete('theme-id')).resolves.toEqual({ message: 'Theme deleted' })
        expect(db.update).toHaveBeenCalled()
        expect(db.delete).toHaveBeenCalled()
    })
})
