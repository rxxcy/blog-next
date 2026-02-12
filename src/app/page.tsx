import {
  Claude,
  Cursor,
  Gemini,
  GLMV,
  Grok,
  Kimi,
  Minimax,
  OpenAI,
  OpenClaw,
  Qwen,
  Sora,
  Suno,
} from '@lobehub/icons'
import { SkillIconsImage } from '@/components/skill-icons-image'
import { PROJECTS } from '@/data/projects'
import { readAlbumsList } from '@/lib/albums-data'
import { readAllPosts } from '@/lib/posts'

type StackIcon = {
  id: string
  label: string
  icon?: string
}

type StackGroup = {
  title: string
  icons: StackIcon[]
}

type AboutMetric = {
  id: string
  label: string
  value: string
  hint: string
}

function getDefaultSkillIconSrc(id: string) {
  return `https://skillicons.dev/icons?i=${id}&theme=light`
}

function resolveStackIconSources(icon: StackIcon) {
  const fallbackSrc = getDefaultSkillIconSrc(icon.id)
  if (!icon.icon) {
    return { src: fallbackSrc, fallbackSrc: undefined }
  }

  return { src: icon.icon, fallbackSrc }
}

const LANGUAGE_GROUPS = [
  // Set icon to prioritize your own icon, e.g. { id: "rust", label: "Rust", icon: "/image/stack/rust.svg" }.
  {
    title: 'Programming Languages',
    icons: [
      { id: 'golang', label: 'Go' },
      { id: 'nodejs', label: 'Node.js' },
      { id: 'bun', label: 'Bun' },
      { id: 'python', label: 'Python' },
      { id: 'php', label: 'PHP' },
    ],
  },
  {
    title: 'Web',
    icons: [
      {
        id: 'gin',
        label: 'gin',
        icon: 'https://cat.cf.51111111.xyz/landscape/webp/20260212-fc140ca0.webp',
      },
      {
        id: 'hono',
        label: 'Hono',
        icon: 'https://cat.cf.51111111.xyz/landscape/webp/20260212-0acd9c21.webp',
      },
      { id: 'nestjs', label: 'NestJS' },
      { id: 'vue', label: 'Vue' },
      { id: 'react', label: 'React' },
      { id: 'svelte', label: 'Svelte' },
      { id: 'solidjs', label: 'SolidJS' },
      { id: 'nextjs', label: 'Next.js' },
      { id: 'remix', label: 'Remix' },
      { id: 'nuxtjs', label: 'Nuxt.js' },
      { id: 'astro', label: 'Astro' },
      { id: 'tailwind', label: 'Tailwind CSS' },
      {
        id: 'shadcn',
        label: 'Shadcn',
        icon: 'https://cat.cf.51111111.xyz/landscape/webp/20260212-9865d04d.webp',
      },
      { id: 'electron', label: 'Electron' },
      {
        id: 'wails',
        label: 'Wails',
        icon: 'https://cat.cf.51111111.xyz/landscape/webp/20260212-8073a5cb.webp',
      },
    ],
  },
  {
    title: 'Databases',
    icons: [
      { id: 'postgres', label: 'PostgreSQL' },
      { id: 'mysql', label: 'MySQL' },
      { id: 'mongodb', label: 'MongoDB' },
      { id: 'redis', label: 'Redis' },
      { id: 'elasticsearch', label: 'Elasticsearch' },
    ],
  },
  {
    title: 'Other',
    icons: [
      { id: 'debian', label: 'Debian' },
      { id: 'docker', label: 'Docker' },
      { id: 'kafka', label: 'Kafka' },
      { id: 'git', label: 'Git' },
      { id: 'cloudflare', label: 'Cloudflare' },
      { id: 'vercel', label: 'Vercel' },
    ],
  },
  {
    title: 'Learning',
    icons: [
      { id: 'rust', label: 'Rust' },
      { id: 'tauri', label: 'Tauri' },
    ],
  },
] satisfies StackGroup[]

const SKILL_ICON_CLASS = 'h-[38px] w-[38px]'

const renderSkillIcons = (icons: StackIcon[]) =>
  icons.map(icon => {
    const { src, fallbackSrc } = resolveStackIconSources(icon)
    return (
      <SkillIconsImage
        key={icon.id}
        src={src}
        fallbackSrc={fallbackSrc}
        alt={`${icon.label} icon`}
        className={SKILL_ICON_CLASS}
        withBackground={Boolean(icon.icon)}
      />
    )
  })

const LLM_ICONS = [
  { id: 'openai', label: 'OpenAI', Icon: OpenAI },
  { id: 'claude', label: 'Claude', Icon: Claude.Color },
  { id: 'gemini', label: 'Gemini', Icon: Gemini.Color },
  { id: 'grok', label: 'Grok', Icon: Grok },
  { id: 'glm', label: 'GLM', Icon: GLMV.Color },
  { id: 'qwen', label: 'Qwen', Icon: Qwen.Color },
  { id: 'kimi', label: 'Kimi', Icon: Kimi },
  { id: 'minimax', label: 'Minimax', Icon: Minimax.Color },
]

const APPLACATIONS_ICONS = [
  { id: 'cursor', label: 'Cursor', Icon: Cursor },
  { id: 'sora', label: 'Sora', Icon: Sora },
  { id: 'suno', label: 'Suno', Icon: Suno },
  { id: 'openclaw', label: 'OpenClaw', Icon: OpenClaw },
]

async function getAboutMetrics(): Promise<AboutMetric[]> {
  const [posts, { albums }] = await Promise.all([
    readAllPosts({ includeDraft: false }),
    readAlbumsList(),
  ])

  const completedProjects = PROJECTS.filter(
    project => project.status === 'done'
  ).length
  const commitCountRaw = process.env.NEXT_PUBLIC_GIT_COMMIT_COUNT ?? ''
  const commitCount = Number.parseInt(commitCountRaw, 10)
  const commitCountText = Number.isFinite(commitCount)
    ? commitCount.toLocaleString('en-US')
    : '--'

  return [
    {
      id: 'notes',
      label: 'NOTES',
      value: posts.length.toLocaleString('en-US'),
      hint: '篇',
    },
    {
      id: 'albums',
      label: 'ALBUMS',
      value: albums.length.toLocaleString('en-US'),
      hint: '个图集',
    },
    {
      id: 'projects',
      label: 'PROJECTS',
      value: `${completedProjects}/${PROJECTS.length}`,
      hint: '已完成',
    },
    {
      id: 'updates',
      label: 'UPDATES',
      value: commitCountText,
      hint: '程序更新次数',
    },
  ]
}

export default async function Home() {
  const aboutMetrics = await getAboutMetrics()

  return (
    <div className='space-y-10 px-4 md:px-0'>
      <section className='space-y-4'>
        <h1 className='text-2xl font-semibold tracking-tight mb-4'>Hi</h1>
        <p className='text-base leading-7 text-muted-foreground'>
          一个啥都能写点的全沾开发者.
          <br />
          首席 AI 战略指挥工程师.
          <small className='line-through text-gray-400 hidden'>
            究极指挥家 (bushi)
          </small>
          <br />
          不太热衷业务堆叠，更喜欢把自己的想法落成实际可用的东西.
          <br />
          不喜过度表达.
        </p>
      </section>

      <section>
        <h1 className='text-2xl font-semibold tracking-tight mb-4'>
          Tech Stack
        </h1>

        <h3 className='text-gray-500 font-semibold tracking-tight mb-2'>
          STACK
        </h3>
        <div className='space-y-4'>
          {LANGUAGE_GROUPS.map(group => (
            <div key={group.title} className='space-y-2'>
              <h4 className='text-xs text-muted-foreground'>{group.title}</h4>
              <div className='flex flex-wrap gap-1.5'>
                {renderSkillIcons(group.icons)}
              </div>
            </div>
          ))}
        </div>
        <h3 className='text-gray-500 font-semibold tracking-tight mb-2 mt-6'>
          LLM
        </h3>
        <div className='flex flex-wrap gap-1.5'>
          {LLM_ICONS.map(({ id, label, Icon }) => (
            <div
              key={id}
              role='img'
              aria-label={label}
              className='flex h-[38px] w-[38px] items-center justify-center'
            >
              <Icon size={28} />
            </div>
          ))}
        </div>

        <h3 className='text-gray-500 font-semibold tracking-tight mb-2 mt-6'>
          APPLACATIONS
        </h3>
        <div className='flex flex-wrap gap-1.5'>
          {APPLACATIONS_ICONS.map(({ id, label, Icon }) => (
            <div
              key={id}
              role='img'
              aria-label={label}
              className='flex h-[38px] w-[38px] items-center justify-center'
            >
              <Icon size={28} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h1 className='text-2xl font-semibold tracking-tight mb-4'>Find Me</h1>
        <div className='flex flex-col gap-2 text-sm'>
          <a
            href='https://github.com/rxxcy'
            target='_blank'
            rel='noreferrer'
            className='cursor-pointer text-foreground/80 transition-colors hover:text-foreground'
          >
            GitHub
          </a>
          <a
            href='https://x.com/ikun977'
            target='_blank'
            rel='noreferrer'
            className='cursor-pointer text-foreground/80 transition-colors hover:text-foreground'
          >
            X / Twitter
          </a>
          <a
            href='mailto:rxxcy@vip.qq.com'
            className='cursor-pointer text-foreground/80 transition-colors hover:text-foreground'
          >
            Email
          </a>
        </div>
      </section>

      <section>
        <h1 className='text-2xl font-semibold tracking-tight mb-4'>About</h1>
        <p className='text-sm leading-6 text-foreground/80'>
          写点可复用的思路，也记录持续推进的实践。
        </p>
        <ul className='mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4'>
          {aboutMetrics.map(metric => (
            <li key={metric.id} className='space-y-1'>
              <p className='text-[10px] tracking-[0.14em] text-muted-foreground/90'>
                {metric.label}
              </p>
              <p className='font-mono text-lg text-foreground tabular-nums'>
                {metric.value}
              </p>
              <p className='text-xs text-muted-foreground'>{metric.hint}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
