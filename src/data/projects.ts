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
    id: "blog",
    title: "Blog",
    summary:
      "当前在持续迭代的个人博客，包含笔记、相册、Moments、Now 页面和内容驱动的展示体系。",
    year: 2026,
    category: "Web",
    status: "in_progress",
    tags: ["Next.js", "TypeScript", "MDX"],
    repo: "",
    demo: "",
  },
  {
    id: "snapdeploy",
    title: "SnapDeploy",
    summary: "把前端构建、环境注入和部署流程合并为一条命令。",
    year: 2026,
    category: "Tool",
    status: "planned",
    tags: ["Node.js", "CLI", "CI/CD"],
    repo: "",
  },
  {
    id: "pulseboard",
    title: "PulseBoard",
    summary: "轻量指标看板，支持最小配置接入和历史趋势对比。",
    year: 2025,
    category: "Web",
    status: "done",
    tags: ["React", "Charts", "Vite"],
    repo: "",
    demo: "",
  },
  {
    id: "llm-playground",
    title: "LLM Playground",
    summary: "用于快速比较提示词与模型输出差异的实验平台。",
    year: 2025,
    category: "Experiment",
    status: "in_progress",
    tags: ["AI", "Prompt", "Evaluation"],
    repo: "",
  },
  {
    id: "img-pipeline",
    title: "Img Pipeline",
    summary: "批量图片处理与压缩脚本，支持多格式与并发任务。",
    year: 2024,
    category: "Tool",
    status: "done",
    tags: ["Go", "Image", "Batch"],
    repo: "",
  },
  {
    id: "taskflow-lab",
    title: "Taskflow Lab",
    summary: "围绕任务编排与自动化触发的流程实验集合。",
    year: 2024,
    category: "Experiment",
    status: "done",
    tags: ["Automation", "Workflow", "Queue"],
    repo: "",
  },
];
