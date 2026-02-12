import Image from 'next/image'

type MomentItem = {
  id: string
  content: string
  publishedAt: string
  title?: string
  images?: {
    src: string
    alt: string
  }[]
}

const MOMENTS: MomentItem[] = [
  {
    id: '2026-02-08-1',
    content: '把项目页的信息密度再压了一次，读起来顺很多。',
    publishedAt: '2026-02-08T21:14:00Z',
    title: '项目页',
  },
  {
    id: '2026-02-08-2',
    content: '今天把笔记列表改成按年度分组，后续回看会更快。',
    publishedAt: '2026-02-08T10:20:00Z',
    title: '笔记',
  },
  {
    id: '2026-02-06-1',
    content: '一边改样式一边记想法，节奏比单独开文档更顺手。',
    publishedAt: '2026-02-06T18:42:00Z',
    title: '工作流',
    images: [
      {
        src: '/avatar.jpg',
        alt: '工作台截图占位图',
      },
      {
        src: '/next.svg',
        alt: '项目标识占位图',
      },
    ],
  },
  {
    id: '2026-02-05-1',
    content: '减少无效组件抽象后，维护成本明显下降。',
    publishedAt: '2026-02-05T09:36:00Z',
  },
]

const formatDateTime = (dateTime: string) =>
  `${dateTime.slice(0, 10)} ${dateTime.slice(11, 16)}`
const SORTED_MOMENTS = [...MOMENTS].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
)

export default function MomentsPage() {
  return (
    <section className='space-y-8'>
      <header className='space-y-2'>
        <p className='text-sm text-muted-foreground/90 dark:text-muted-foreground/80 text-right'>
          碎片想法与日常记录
        </p>
      </header>

      <ul className='space-y-0 md:space-y-6'>
        {SORTED_MOMENTS.map((moment, index) => (
          <li
            key={moment.id}
            className={`${index === 0 ? 'border-y' : 'border-b'} border-border/60 md:border-0`}
          >
            <article className='relative px-3 pb-3 pt-4 transition-colors duration-200 hover:bg-muted/20 md:rounded-md md:border md:border-border/60 md:bg-muted/20 md:hover:bg-muted/35'>
              <time
                dateTime={moment.publishedAt}
                className='absolute -top-2 left-3 bg-background/95 px-1 text-xs text-foreground/70 dark:text-foreground/55'
              >
                {formatDateTime(moment.publishedAt)}
                {moment.title ? ` • ${moment.title}` : ''}
              </time>

              <p className='text-sm leading-7 text-foreground/88 dark:text-foreground/72'>
                {moment.content}
              </p>

              {moment.images?.length ? (
                <ul className='mt-2 flex flex-wrap gap-2'>
                  {moment.images.map(image => (
                    <li key={`${moment.id}-${image.src}`}>
                      <div className='overflow-hidden'>
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={72}
                          height={72}
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
    </section>
  )
}
