import type { Metadata } from "next";
import { LinkSiteIcon } from "@/components/link-site-icon";
import { readLinks } from "@/lib/links";

export const metadata: Metadata = {
  title: "导航",
  description: "按大分类整理的常用网址导航。",
};

function getHostnameLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function LinksPage() {
  const groups = await readLinks();

  return (
    <section className="space-y-8 px-4 pb-4 md:px-0">
      <header className="space-y-2">
        <p className="text-right text-sm text-muted-foreground">常用网址</p>
        <h1 className="text-2xl font-semibold tracking-tight">导航</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          按主题整理的常用站点，先保证易找、易扫，再慢慢补全。
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无链接数据</p>
      ) : (
        <div className="space-y-8 md:relative md:left-1/2 md:w-[min(calc(100vw-3rem),72rem)] md:max-w-none md:-translate-x-1/2">
          {groups.map((group) => (
            <section key={group.category} className="space-y-4">
              <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-2">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {group.category}
                  </h2>
                  {group.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {group.description}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {String(group.items.length).padStart(2, "0")}
                </p>
              </div>

              <ul className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((item) => {
                  const hostname = getHostnameLabel(item.url);

                  return (
                    <li key={item.url} className="min-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex h-full cursor-pointer items-start gap-2.5 rounded-lg border border-transparent px-2.5 py-2.5 transition-colors duration-200 hover:border-border/70 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      >
                        <LinkSiteIcon
                          title={item.title}
                          src={item.icon}
                          domain={hostname}
                          className="h-8 w-8 rounded-lg text-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium leading-5 text-foreground">
                            {item.title}
                          </h3>

                          {item.summary ? (
                            <p className="mt-0.5 truncate text-[13px] leading-5 text-muted-foreground">
                              {item.summary}
                            </p>
                          ) : null}

                          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="shrink-0 font-mono">
                              {hostname}
                            </span>
                            {item.tags.length > 0 ? (
                              <span className="truncate">
                                #{item.tags.join(" #")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
