import Link from "next/link";
import {
  PROJECTS,
  type ProjectItem,
  type ProjectStatus,
} from "@/data/projects";

const STATUS_SECTIONS: Array<{ key: ProjectStatus; title: string }> = [
  { key: "planned", title: "计划中" },
  { key: "in_progress", title: "进行中" },
  { key: "done", title: "已完成" },
];

function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <article className="group relative overflow-hidden border border-border/70 px-4 py-4 transition-colors duration-200 hover:border-foreground/25">
      <h3 className="text-base font-medium leading-6 text-foreground">
        {project.title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {project.summary}
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        {project.year} • #{project.tags.join(" #")}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs">
        {project.repo ? (
          <Link
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-foreground/80 transition-colors duration-200 hover:text-foreground"
          >
            GitHub
          </Link>
        ) : null}
        {project.demo ? (
          <Link
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-foreground/80 transition-colors duration-200 hover:text-foreground"
          >
            Demo
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectsList() {
  return (
    <div className="space-y-8">
      {STATUS_SECTIONS.map((section) => {
        const items = PROJECTS.filter(
          (project) => project.status === section.key,
        );

        return (
          <section key={section.key} className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {section.title}
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无项目</p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {items.map((project) => (
                  <li key={project.id}>
                    <ProjectCard project={project} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
