import Image from 'next/image'
import { formatMomentDateTime, readAllMoments } from '@/lib/moments'

export default async function MomentsPage() {
  const moments = await readAllMoments()

  return (
    <section className='space-y-8'>
      <header className='space-y-2'>
        <p className='text-sm text-muted-foreground/90 dark:text-muted-foreground/80 text-right'>
          碎片想法与日常记录
        </p>
      </header>

      {moments.length === 0 ? (
        <p className='text-sm text-muted-foreground'>还没有瞬间内容。</p>
      ) : (
        <ul className='space-y-0 md:space-y-6'>
          {moments.map((moment, index) => (
            <li
              key={moment.id}
              className={`${index === 0 ? 'border-y' : 'border-b'} border-border/60 md:border-0`}
            >
              <article className='relative px-3 pb-3 pt-4 transition-colors duration-200 hover:bg-muted/20 md:rounded-md md:border md:border-border/60 md:bg-muted/20 md:hover:bg-muted/35'>
                <time
                  dateTime={moment.publishedAt}
                  className='absolute -top-2 left-3 bg-background/95 px-1 text-xs text-foreground/70 dark:text-foreground/55'
                >
                  {formatMomentDateTime(moment.publishedAt)}
                  {moment.title ? ` • ${moment.title}` : ''}
                </time>

                <p className='text-sm leading-7 text-foreground/88 dark:text-foreground/72'>
                  {moment.content}
                </p>

                {moment.images?.length ? (
                  <ul className='mt-2 flex flex-wrap gap-2'>
                    {moment.images.map((image, imageIndex) => (
                      <li key={`${moment.id}-${image.src}-${imageIndex}`}>
                        <div className='overflow-hidden'>
                          <Image
                            src={image.src}
                            alt={image.alt ?? `${moment.id}-${imageIndex + 1}`}
                            width={image.width ?? 72}
                            height={image.height ?? 72}
                            className='h-[72px] w-[72px] object-cover'
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
