export function Footer() {
  const year = new Date().getFullYear();
  const icpText = "滇ICP备17008924号";
  const commitHash = process.env.NEXT_PUBLIC_GIT_COMMIT_HASH ?? "unknown";

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-1 px-4 py-4 text-xs text-muted-foreground md:flex-row md:justify-between md:gap-2 md:px-6">
        <div className="flex flex-col items-center gap-1 md:flex-row md:items-center md:gap-2">
          <p>© {year} 若许闲乘月</p>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {icpText}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px]">{commitHash}</span>
          <span aria-hidden="true">·</span>
          <a
            href="/rss.xml"
            className="transition-colors hover:text-foreground"
          >
            RSS
          </a>
          <span aria-hidden="true">·</span>
          <span>Next.js 16 / v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
