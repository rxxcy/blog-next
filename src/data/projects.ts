export type ProjectCategory = "Web" | "Tool" | "Experiment";
export type ProjectStatus = "planned" | "in_progress" | "done";

export type ProjectItem = {
  id: string;
  title: string;
  summary: string;
  year: number;
  category: ProjectCategory;
  status: ProjectStatus;
  tags: string[];
  repo?: string;
  demo?: string;
};

export const PROJECTS: ProjectItem[] = [
  {
    id: "devnotes",
    title: "DevNotes",
    summary: "面向个人的开发笔记系统，强调快速记录和后续检索。",
    year: 2026,
    category: "Web",
    status: "in_progress",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    repo: "https://github.com/example/devnotes",
    demo: "https://devnotes.example.com",
  },
  {
    id: "snapdeploy",
    title: "SnapDeploy",
    summary: "把前端构建、环境注入和部署流程合并为一条命令。",
    year: 2026,
    category: "Tool",
    status: "planned",
    tags: ["Node.js", "CLI", "CI/CD"],
    repo: "https://github.com/example/snapdeploy",
  },
  {
    id: "pulseboard",
    title: "PulseBoard",
    summary: "轻量指标看板，支持最小配置接入和历史趋势对比。",
    year: 2025,
    category: "Web",
    status: "done",
    tags: ["React", "Charts", "Vite"],
    repo: "https://github.com/example/pulseboard",
    demo: "https://pulseboard.example.com",
  },
  {
    id: "llm-playground",
    title: "LLM Playground",
    summary: "用于快速比较提示词与模型输出差异的实验平台。",
    year: 2025,
    category: "Experiment",
    status: "in_progress",
    tags: ["AI", "Prompt", "Evaluation"],
    repo: "https://github.com/example/llm-playground",
  },
  {
    id: "img-pipeline",
    title: "Img Pipeline",
    summary: "批量图片处理与压缩脚本，支持多格式与并发任务。",
    year: 2024,
    category: "Tool",
    status: "done",
    tags: ["Go", "Image", "Batch"],
    repo: "https://github.com/example/img-pipeline",
  },
  {
    id: "taskflow-lab",
    title: "Taskflow Lab",
    summary: "围绕任务编排与自动化触发的流程实验集合。",
    year: 2024,
    category: "Experiment",
    status: "done",
    tags: ["Automation", "Workflow", "Queue"],
    repo: "https://github.com/example/taskflow-lab",
  },
];
