import Image from 'next/image'
import Link from 'next/link'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { formatAlbumDate, readAlbumsList } from '@/lib/albums-data'

export default async function AlbumsPage() {
  const { albums, unreadableCount } = await readAlbumsList()

  return (
    <section className='space-y-6 px-4 md:px-0'>
      <header className='space-y-2'>
        {/* <h1 className="text-2xl font-semibold tracking-tight">相册</h1> */}
        <p className='text-sm text-muted-foreground text-right'>
          且将新火试新茶
        </p>
      </header>

      {albums.length === 0 ? (
        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>还没有可展示的图集。</p>
          {unreadableCount > 0 ? (
            <p className='text-xs text-muted-foreground/80'>
              有 {unreadableCount} 个图集数据读取失败，请检查 `manifest.json`。
            </p>
          ) : null}
        </div>
      ) : (
        <div className='space-y-2'>
          {unreadableCount > 0 ? (
            <p className='text-xs text-muted-foreground/80'>
              已跳过 {unreadableCount} 个损坏图集数据。
            </p>
          ) : null}
          <ul className='grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3'>
            {albums.map(album => (
              <li key={album.slug}>
                <Link
                  href={`/albums/${album.slug}`}
                  className='group block overflow-hidden border border-border/60 transition-transform duration-150 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none'
                >
                  <AspectRatio
                    ratio={3 / 2}
                    className='relative w-full bg-muted/30'
                  >
                    <Image
                      src={album.coverSrc}
                      alt={`${album.title} cover`}
                      fill
                      className='object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none'
                      sizes='(max-width: 768px) 100vw, 50vw'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/76 via-black/24 to-transparent' />
                    {album.requiresPassword ? (
                      <span className='absolute right-2 top-2 border border-white/35 bg-black/45 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/90'>
                        Protected
                      </span>
                    ) : null}
                    <div className='absolute inset-x-0 bottom-0 space-y-1.5 px-3 py-3'>
                      <time
                        dateTime={album.date ?? undefined}
                        className='block text-[11px] text-white/74'
                      >
                        {formatAlbumDate(album.date)}
                      </time>
                      <div className='flex items-end gap-2'>
                        <h2 className='truncate text-base font-semibold leading-tight text-white/96'>
                          {album.title}
                        </h2>
                        <span className='shrink-0 text-[11px] font-normal text-white/66'>
                          ({album.imageCount} 张)
                        </span>
                      </div>
                      <p className='truncate text-xs leading-5 text-white/84'>
                        {album.description}
                      </p>
                    </div>
                  </AspectRatio>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
