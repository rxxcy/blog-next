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

type StackIcon = {
  id: string
  label: string
  icon?: string
}

type StackGroup = {
  title: string
  icons: StackIcon[]
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

export default function Home() {
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
            href='https://github.com/'
            className='cursor-pointer text-foreground/80 transition-colors hover:text-foreground'
          >
            GitHub
          </a>
          <a
            href='https://x.com/'
            className='cursor-pointer text-foreground/80 transition-colors hover:text-foreground'
          >
            X / Twitter
          </a>
          <a
            href='mailto:hello@example.com'
            className='cursor-pointer text-foreground/80 transition-colors hover:text-foreground'
          >
            Email
          </a>
        </div>
      </section>

      <section>
        <h1 className='text-2xl font-semibold tracking-tight mb-4'>About</h1>
        <p className='text-sm leading-6 text-foreground/80'>
          记录灵感、实验与笔记。保持简洁，可读性优先。长期维护，轻量更新。
        </p>
      </section>
    </div>
  )
}
