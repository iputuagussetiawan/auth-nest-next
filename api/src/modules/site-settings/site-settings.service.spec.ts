import { SiteSettingsService } from './site-settings.service'

function query(result: unknown[]) {
    return { from: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(result) }
}
function updateQuery(result: unknown[]) {
    return {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(result),
    }
}
function insertQuery(result: unknown[]) {
    return { values: jest.fn().mockReturnThis(), returning: jest.fn().mockResolvedValue(result) }
}

describe('SiteSettingsService', () => {
    it('returns stored settings', async () => {
        const settings = { id: 'settings-id', siteName: 'Acme' }
        const service = new SiteSettingsService({
            select: jest.fn().mockReturnValue(query([settings])),
        } as never)
        await expect(service.get()).resolves.toEqual(settings)
    })

    it('returns defaults when settings do not exist', async () => {
        const service = new SiteSettingsService({
            select: jest.fn().mockReturnValue(query([])),
        } as never)
        await expect(service.get()).resolves.toEqual(
            expect.objectContaining({ id: null, siteName: 'My App', maintenanceMode: false }),
        )
    })

    it('updates existing settings', async () => {
        const existing = { id: 'settings-id', siteName: 'Old' }
        const updated = { ...existing, siteName: 'New' }
        const update = updateQuery([updated])
        const db = {
            select: jest.fn().mockReturnValue(query([existing])),
            update: jest.fn().mockReturnValue(update),
        }
        const service = new SiteSettingsService(db as never)

        await expect(service.update({ siteName: 'New' } as never)).resolves.toEqual(updated)
        expect(update.set).toHaveBeenCalledWith(
            expect.objectContaining({ siteName: 'New', updatedAt: expect.any(Date) }),
        )
    })

    it('creates initial settings when none exist', async () => {
        const created = { id: 'settings-id', siteName: 'New' }
        const insert = insertQuery([created])
        const db = {
            select: jest.fn().mockReturnValue(query([])),
            insert: jest.fn().mockReturnValue(insert),
        }
        const service = new SiteSettingsService(db as never)

        await expect(service.update({ siteName: 'New' } as never)).resolves.toEqual(created)
        expect(insert.values).toHaveBeenCalledWith(
            expect.objectContaining({ siteName: 'New', maintenanceMode: false }),
        )
    })
})
