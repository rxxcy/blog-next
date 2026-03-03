import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { MdxImage } from "@/components/mdx-image";
import { MdxPre } from "@/components/mdx-pre";

function Callout({
  children,
  type = "info",
}: {
  children: ReactNode;
  type?: "info" | "warn" | "success";
}) {
  const colorMap = {
    info: "border-blue-300/70 bg-blue-50/40 dark:border-blue-400/30 dark:bg-blue-900/10",
    warn: "border-amber-300/70 bg-amber-50/50 dark:border-amber-400/30 dark:bg-amber-900/10",
    success:
      "border-emerald-300/70 bg-emerald-50/50 dark:border-emerald-400/30 dark:bg-emerald-900/10",
  } as const;

  return (
    <aside className={`my-4 border px-3 py-2 text-sm ${colorMap[type]}`}>
      {children}
    </aside>
  );
}

function A(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href || "";
  const isExternal =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className="underline underline-offset-4 transition-colors hover:text-foreground"
      >
        {props.children}
      </Link>
    );
  }

  if (!isExternal) {
    return (
      <a
        {...props}
        className="underline underline-offset-4 transition-colors hover:text-foreground"
      />
    );
  }

  return (
    <a
      {...props}
      target={props.target ?? "_blank"}
      rel={props.rel ?? "noreferrer"}
      className="underline underline-offset-4 transition-colors hover:text-foreground"
    />
  );
}

export const mdxComponents = {
  Callout,
  a: A,
  img: MdxImage,
  pre: MdxPre,
};
