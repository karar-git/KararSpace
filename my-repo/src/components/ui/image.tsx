import { forwardRef, type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils';

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fittingType?: 'fill' | 'fit';
}

/**
 * Simple Image component - replaces Wix image-kit
 * Just renders a regular img tag with optional object-fit handling
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, className, fittingType = 'fill', alt = '', ...props }, ref) => {
    if (!src) {
      return <div data-empty-image className={className} />
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(
          fittingType === 'fit' ? 'object-contain' : 'object-cover',
          className
        )}
        {...props}
      />
    )
  }
)
Image.displayName = 'Image'
