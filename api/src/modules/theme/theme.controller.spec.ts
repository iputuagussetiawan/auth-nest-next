import { ThemeController } from './theme.controller'

describe('ThemeController', () => {
    const service = {
        getMyTheme: jest.fn(), getAllPublic: jest.fn(), getActive: jest.fn(), setPreference: jest.fn(),
        getAll: jest.fn(), create: jest.fn(), activate: jest.fn(), update: jest.fn(), delete: jest.fn(),
    }
    const controller = new ThemeController(service as never)

    beforeEach(() => jest.clearAllMocks())

    it('wraps public and preference endpoints', async () => {
        service.getMyTheme.mockResolvedValue({ id: 'theme-id' })
        service.getAllPublic.mockResolvedValue([{ id: 'theme-id' }])
        service.getActive.mockResolvedValue({ id: 'theme-id' })
        service.setPreference.mockResolvedValue({ themeId: 'theme-id' })

        await expect(controller.getMyTheme({ user: { userId: 'user-id' } })).resolves.toEqual({ status: 'success', message: 'My theme', data: { id: 'theme-id' } })
        await expect(controller.listPublic()).resolves.toEqual({ status: 'success', message: 'Themes', data: [{ id: 'theme-id' }] })
        await expect(controller.getActive()).resolves.toEqual({ status: 'success', message: 'Active theme', data: { id: 'theme-id' } })
        await expect(controller.setPreference({ user: { userId: 'user-id' } }, { themeId: 'theme-id' })).resolves.toEqual({ status: 'success', message: 'Theme preference updated', data: { themeId: 'theme-id' } })
        expect(service.getMyTheme).toHaveBeenCalledWith('user-id')
        expect(service.setPreference).toHaveBeenCalledWith('user-id', 'theme-id')
    })

    it('wraps admin theme operations', async () => {
        service.getAll.mockResolvedValue([])
        service.create.mockResolvedValue({ id: 'theme-id' })
        service.activate.mockResolvedValue({ id: 'theme-id', isActive: true })
        service.update.mockResolvedValue({ id: 'theme-id' })
        service.delete.mockResolvedValue({ message: 'Theme deleted' })

        await expect(controller.getAll()).resolves.toEqual({ status: 'success', message: 'Themes fetched', data: [] })
        await expect(controller.create({ name: 'Ocean' } as never)).resolves.toEqual({ status: 'success', message: 'Theme created', data: { id: 'theme-id' } })
        await expect(controller.activate('theme-id')).resolves.toEqual({ status: 'success', message: 'Theme activated', data: { id: 'theme-id', isActive: true } })
        await expect(controller.update('theme-id', {} as never)).resolves.toEqual({ status: 'success', message: 'Theme updated', data: { id: 'theme-id' } })
        await expect(controller.delete('theme-id')).resolves.toEqual({ status: 'success', message: 'Theme deleted', data: null })
    })
})
