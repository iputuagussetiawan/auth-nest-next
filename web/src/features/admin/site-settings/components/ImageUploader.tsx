'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Globe, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { UiInput } from '@/components/ui-custom/UiInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { adminSiteSettingsService } from '../services/SiteSettingsService'

type UploadMode = 'upload' | 'url'

interface ImageUploaderProps {
    label: string
    hint: string
    value: string
    onChange: (url: string) => void
    /** Tailwind size classes for the dropzone, e.g. "h-[100px] w-[100px]" (square) or "h-[120px] w-full" (wide). */
    dropzoneClassName?: string
    /** Tailwind size classes for the preview thumbnail once an image is set. */
    previewClassName?: string
    maxSizeKb?: number
}

const DEFAULT_DROPZONE_CLASSNAME = 'h-[100px] w-[100px]'
const DEFAULT_PREVIEW_CLASSNAME = 'h-14 w-14'

export function ImageUploader({
    label,
    hint,
    value,
    onChange,
    dropzoneClassName = DEFAULT_DROPZONE_CLASSNAME,
    previewClassName = DEFAULT_PREVIEW_CLASSNAME,
    maxSizeKb = 200,
}: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [mode, setMode] = useState<UploadMode>('upload')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [urlDraft, setUrlDraft] = useState(value)

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed')
            return
        }
        if (file.size > maxSizeKb * 1024) {
            toast.error(`File too large — max ${maxSizeKb} KB`)
            return
        }
        setUploading(true)
        try {
            const res = await adminSiteSettingsService.uploadAsset(file, value || undefined)
            onChange(res.data.url)
            setUrlDraft(res.data.url)
            toast.success('Image uploaded')
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleClear = async () => {
        if (value?.startsWith('http')) {
            try {
                await adminSiteSettingsService.deleteAsset(value)
            } catch {}
        }
        onChange('')
        setUrlDraft('')
    }

    const handleUrlApply = () => {
        onChange(urlDraft.trim())
    }

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        e.target.value = ''
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    return (
        <div className="space-y-3">
            {/* Header row: label + mode toggle */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>
                </div>
                <div className="bg-muted/40 flex shrink-0 items-center rounded-lg border p-0.5">
                    <button
                        type="button"
                        onClick={() => setMode('upload')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Upload className="h-3.5 w-3.5" /> Upload
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('url')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'url' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Globe className="h-3.5 w-3.5" /> URL
                    </button>
                </div>
            </div>

            {/* Current image preview (always visible when set) */}
            {value && (
                <div className="bg-muted/20 flex items-center gap-3 rounded-lg border px-4 py-3">
                    <Image
                        src={value}
                        alt={label}
                        width={128}
                        height={128}
                        unoptimized
                        className={cn('shrink-0 rounded-md object-contain', previewClassName)}
                        onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-foreground text-xs font-medium">Current image</p>
                        <p className="text-muted-foreground truncate text-xs">{value}</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={handleClear}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Upload mode */}
            {mode === 'upload' && (
                <div className="flex flex-wrap items-center gap-4">
                    <div
                        className={cn(
                            'flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors',
                            dropzoneClassName,
                            dragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-muted/20 hover:border-muted-foreground/40',
                        )}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragOver(true)
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => !uploading && inputRef.current?.click()}
                        style={{ cursor: uploading ? 'default' : 'pointer' }}
                    >
                        {uploading ? (
                            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                                    <Upload className="text-muted-foreground h-5 w-5" />
                                </div>
                                <p className="text-muted-foreground text-center text-[11px] leading-tight font-medium">
                                    Drop or click
                                </p>
                            </>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onFileInput}
                        />
                    </div>

                    <div className="space-y-1 text-sm">
                        <p className="text-foreground font-medium">
                            {value ? 'Replace current image' : 'Upload a new image'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            PNG, JPG, SVG, WebP, ICO — max {maxSizeKb} KB
                        </p>
                    </div>
                </div>
            )}

            {/* URL mode */}
            {mode === 'url' && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <UiInput
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && (e.preventDefault(), handleUrlApply())
                            }
                            placeholder="https://example.com/logo.png"
                            className="font-mono text-xs"
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleUrlApply}
                            disabled={!urlDraft.trim() || urlDraft.trim() === value}
                        >
                            Apply
                        </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Press Enter or click Apply to preview the URL.
                    </p>
                </div>
            )}
        </div>
    )
}
