import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

export const useFormPersist = (form: UseFormReturn<any>, storageKey: string) => {
    const { watch, setValue } = form
    const values = watch()

    // 1. Load data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(storageKey)
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                // We loop through keys to avoid overwriting internal form state
                Object.keys(parsedData).forEach((key) => {
                    setValue(key, parsedData[key], { shouldValidate: true })
                })
            } catch (e) {
                console.error('Failed to load persisted form data', e)
            }
        }
    }, [setValue, storageKey])

    // 2. Save data to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(values))
    }, [values, storageKey])

    // 3. Clear data helper (call this after successful DB submission)
    const clearStorage = () => localStorage.removeItem(storageKey)

    return { clearStorage }
}
