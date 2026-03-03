import { notFound } from 'next/navigation'
import { formatAlbumDate, readAlbumDetail } from '@/lib/albums-data'
import { HistoryBackButton } from '@/components/history-back-button'
import { AlbumPhotoPreviewGrid } from '@/components/album-photo-preview-grid'

type AlbumDetailPageProps = {
  params: Promise<{ slug: string }>
}

export default async function AlbumDetailPage({
  params,
}: AlbumDetailPageProps) {
  const { slug } = await params
  const album = await readAlbumDetail(slug)

  if (!album) {
    notFound()
  }

  return (
    <section className='space-y-6 px-4 md:px-0'>
      <header className='space-y-2'>
        <HistoryBackButton
          className='inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
          fallbackHref='/albums'
        >
          <span>cd ..</span>
        </HistoryBackButton>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {album.title}
          </h1>
          {album.requiresPassword ? (
            <span className='border border-border/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground'>
              Protected
            </span>
          ) : null}
        </div>
        <p className='text-sm text-muted-foreground'>{album.description}</p>
        <p className='text-xs text-muted-foreground'>
          {formatAlbumDate(album.date)} · {album.imageCount} 张
        </p>
        {album.passwordHint ? (
          <p className='text-xs text-muted-foreground/90'>
            密码提示：{album.passwordHint}
          </p>
        ) : null}
      </header>

      {album.images.length === 0 ? (
        <p className='text-sm text-muted-foreground'>这个图集还没有图片。</p>
      ) : (
        <div className='relative left-1/2 w-[90vw] max-w-[1800px] -translate-x-1/2'>
          <AlbumPhotoPreviewGrid albumTitle={album.title} images={album.images} />
        </div>
      )}
    </section>
  )
}
