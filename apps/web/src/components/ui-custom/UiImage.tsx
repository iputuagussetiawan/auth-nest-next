import Image, { type ImageProps } from 'next/image'

function isRemoteImage(src: ImageProps['src']) {
    return typeof src === 'string' && /^https?:\/\//i.test(src)
}

export function UiImage({ src, alt = '', ...props }: ImageProps) {
    const remote = isRemoteImage(src)

    return (
        <Image
            src={src}
            alt={alt}
            {...props}
            loader={remote ? ({ src: imageSrc }) => imageSrc : props.loader}
            unoptimized={remote || props.unoptimized}
        />
    )
}
