import Link from 'next/link'
import {
  formatPostDate,
  formatWordCount,
  type PostMeta,
  readAllPosts,
} from '@/lib/posts'

function groupByYear(posts: PostMeta[]) {
  const grouped = new Map<string, PostMeta[]>()
  for (const post of posts) {
    const year = post.date.slice(0, 4)
    const current = grouped.get(year)
    if (current) {
      current.push(post)
      continue
    }
    grouped.set(year, [post])
  }
  return Array.from(grouped.entries())
}

export default async function NotesPage() {
  const posts = await readAllPosts({
    includeDraft: process.env.NODE_ENV !== 'production',
  })
  const postsByYear = groupByYear(posts)

  return (
    <section className='space-y-8 px-4 md:px-0'>
      <header className='space-y-2'>
        <p className='text-sm text-muted-foreground text-right'>
          留个备忘回头好找
        </p>
      </header>

      {posts.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          还没有文章。可在 <code>content/posts/&lt;year&gt;/*.mdx</code>{' '}
          添加内容。
        </p>
      ) : (
        <div className='space-y-8'>
          {postsByYear.map(([year, yearPosts]) => (
            <section key={year} className='space-y-2'>
              <h2 className='text-xl font-semibold tracking-tight text-muted-foreground/90'>
                {year}
              </h2>
              <ul className='space-y-2'>
                {yearPosts.map(post => (
                  <li key={`${post.year}-${post.slug}`}>
                    <article className='group py-3'>
                      <Link href={post.url}>
                        <h3 className='relative isolate -mx-1 inline-block px-1 text-base font-medium leading-6 text-foreground transition-colors duration-200 group-hover:text-foreground before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-foreground/15 before:transition-transform before:duration-200 group-hover:before:scale-x-100 dark:text-foreground/76 dark:group-hover:text-foreground/92 dark:before:bg-foreground/10 motion-reduce:before:transition-none'>
                          {post.title}
                        </h3>
                      </Link>
                      <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground'>
                        <time dateTime={post.date}>
                          {formatPostDate(post.date)}
                        </time>
                        <span aria-hidden='true'>•</span>
                        <span>{formatWordCount(post.wordCount)}</span>
                        {post.tags.length > 0 ? (
                          <>
                            <span aria-hidden='true'>•</span>
                            <span>
                              {post.tags.map(tag => `#${tag}`).join(' ')}
                            </span>
                          </>
                        ) : null}
                        {post.requiresPassword ? (
                          <>
                            <span aria-hidden='true'>•</span>
                            <span className='uppercase tracking-wide'>
                              Protected
                            </span>
                          </>
                        ) : null}
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
