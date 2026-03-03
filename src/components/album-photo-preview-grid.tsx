'use client'

import Image from 'next/image'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { MasonryGrid } from '@/components/masonry-grid'

type AlbumPhotoPreviewItem = {
  id: string
  thumb: string
  webp: string
  width?: number | null
  height?: number | null
}

type AlbumPhotoPreviewGridProps = {
  albumTitle: string
  images: AlbumPhotoPreviewItem[]
}

const FALLBACK_SIZE = 1200

function normalizeSize(value?: number | null) {
  return typeof value === 'number' && value > 0 ? value : FALLBACK_SIZE
}

export function AlbumPhotoPreviewGrid({
  albumTitle,
  images,
}: AlbumPhotoPreviewGridProps) {
  const items = images.map(image => ({
    id: image.id,
    width: normalizeSize(image.width),
    height: normalizeSize(image.height),
  }))

  return (
    <PhotoProvider>
      <MasonryGrid items={items} columnCounts={[2, 2, 3]}>
        {images.map((image, index) => {
          const width = normalizeSize(image.width)
          const height = normalizeSize(image.height)

          return (
            <PhotoView key={image.id} src={image.webp}>
              <button
                type='button'
                className='group block w-full cursor-zoom-in overflow-hidden border border-border/60 bg-muted/20 text-left'
                aria-label={`预览图片 ${index + 1}`}
              >
                <Image
                  src={image.thumb}
                  alt={`${albumTitle} ${index + 1}`}
                  width={width}
                  height={height}
                  className='block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none'
                  sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
                />
              </button>
            </PhotoView>
          )
        })}
      </MasonryGrid>
    </PhotoProvider>
  )
}
