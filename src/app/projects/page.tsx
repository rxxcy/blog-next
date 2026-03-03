import { ProjectsList } from '@/components/projects-list'

export default function ProjectsPage() {
  return (
    <section className='space-y-6 px-4 md:px-0'>
      <header className='space-y-1'>
        {/* <h1 className="text-xl font-semibold tracking-tight">项目</h1> */}
        <p className='text-sm text-muted-foreground text-right'>趁我还爱写</p>
      </header>

      <ProjectsList />
    </section>
  )
}
