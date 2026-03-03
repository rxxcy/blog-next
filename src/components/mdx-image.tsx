"use client";

import {
  type ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ImageMode = "default" | "wide" | "small";
type Phase = "closed" | "opening" | "open" | "closing";
type Rect = { left: number; top: number; width: number; height: number };

const SQUARE_SIZE_PATTERN = /^\d{2,4}$/;
const TRANSITION_MS = 260;
const PREVIEW_MARGIN = 24;

const WRAP_CLASS: Record<ImageMode, string> = {
  default: "mx-auto my-4 block w-full max-w-[760px]",
  wide: "mx-auto my-6 block w-full max-w-[960px]",
  small: "mx-auto my-4 block w-full max-w-[420px]",
};

const BASE_IMAGE_CLASS = "block h-auto w-full select-none";

function clampSquareSize(value: number) {
  return Math.min(1200, Math.max(80, value));
}

function parseTitleMeta(title?: string | null) {
  if (!title) {
    return { mode: "default" as ImageMode, caption: "", squareSize: null };
  }
  const [rawMode, ...captionParts] = title.split("|");
  const modeToken = rawMode.trim().toLowerCase();
  const caption = captionParts.join("|").trim();

  if (SQUARE_SIZE_PATTERN.test(modeToken)) {
    return {
      mode: "default" as ImageMode,
      caption,
      squareSize: clampSquareSize(Number(modeToken)),
    };
  }

  if (modeToken === "wide" || modeToken === "full") {
    return { mode: "wide" as ImageMode, caption, squareSize: null };
  }
  if (modeToken === "small") {
    return { mode: "small" as ImageMode, caption, squareSize: null };
  }

  return {
    mode: "default" as ImageMode,
    caption: title.trim(),
    squareSize: null,
  };
}

function getViewportTargetRect(ratio: number): Rect {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxWidth = Math.max(120, viewportWidth - PREVIEW_MARGIN * 2);
  const maxHeight = Math.max(120, viewportHeight - PREVIEW_MARGIN * 2);

  let width = maxWidth;
  let height = width / ratio;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  return {
    left: (viewportWidth - width) / 2,
    top: (viewportHeight - height) / 2,
    width,
    height,
  };
}

export function MdxImage({
  alt = "",
  className,
  title,
  style,
  ...props
}: ComponentPropsWithoutRef<"img">) {
  const src = props.src;
  const thumbRef = useRef<HTMLImageElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");
  const [rect, setRect] = useState<Rect | null>(null);

  const { mode, caption, squareSize } = parseTitleMeta(title);

  const wrapperStyle = squareSize
    ? ({
        width: `min(100%, ${squareSize}px)`,
      } satisfies NonNullable<ComponentPropsWithoutRef<"button">["style"]>)
    : undefined;

  const imageStyle = squareSize
    ? ({
        aspectRatio: "1 / 1",
        ...style,
      } satisfies NonNullable<ComponentPropsWithoutRef<"img">["style"]>)
    : style;

  const isVisible = phase !== "closed" && !!rect;
  const isDarkBackdrop = phase === "open";

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const getThumbRect = useCallback(() => {
    const image = thumbRef.current;
    if (!image) return null;
    const box = image.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return null;
    return {
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    } satisfies Rect;
  }, []);

  const getImageRatio = useCallback((origin: Rect) => {
    const image = thumbRef.current;
    if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
      return image.naturalWidth / image.naturalHeight;
    }
    return origin.width / origin.height;
  }, []);

  const closePreview = useCallback(() => {
    if (phase === "closed" || phase === "closing") return;

    clearCloseTimer();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const origin = getThumbRect();

    if (!origin || reducedMotion) {
      setPhase("closed");
      setRect(null);
      return;
    }

    setPhase("closing");
    setRect(origin);

    closeTimerRef.current = window.setTimeout(() => {
      setPhase("closed");
      setRect(null);
      closeTimerRef.current = null;
    }, TRANSITION_MS);
  }, [clearCloseTimer, getThumbRect, phase]);

  const openPreview = useCallback(() => {
    const origin = getThumbRect();
    if (!origin) return;

    clearCloseTimer();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const target = getViewportTargetRect(getImageRatio(origin));

    if (reducedMotion) {
      setRect(target);
      setPhase("open");
      return;
    }

    setRect(origin);
    setPhase("opening");
    requestAnimationFrame(() => {
      setRect(target);
      setPhase("open");
    });
  }, [clearCloseTimer, getImageRatio, getThumbRect]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const closeOnScroll = () => closePreview();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    // Use real scroll event instead of wheel/touchmove so we close with updated layout.
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", closeOnScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closePreview, isVisible]);

  useEffect(() => {
    if (phase !== "open") return;
    const image = thumbRef.current;
    if (!image) return;

    const onResize = () => {
      const ratio =
        image.naturalWidth > 0 && image.naturalHeight > 0
          ? image.naturalWidth / image.naturalHeight
          : 1;
      setRect(getViewportTargetRect(ratio));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase]);

  useEffect(() => {
    if (phase !== "closing") return;

    const syncToThumb = () => {
      const origin = getThumbRect();
      if (origin) setRect(origin);
    };

    window.addEventListener("scroll", syncToThumb, { passive: true });
    window.addEventListener("resize", syncToThumb);
    return () => {
      window.removeEventListener("scroll", syncToThumb);
      window.removeEventListener("resize", syncToThumb);
    };
  }, [getThumbRect, phase]);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className={cn(
          WRAP_CLASS[mode],
          "cursor-zoom-in overflow-hidden border-0 bg-transparent p-0",
        )}
        style={wrapperStyle}
        aria-label={caption ? `预览图片：${caption}` : "预览图片"}
      >
        {/* biome-ignore lint/performance/noImgElement: mdx images need dynamic intrinsic sizing without fixed width/height */}
        <img
          ref={thumbRef}
          {...props}
          src={src}
          alt={alt}
          title={caption || undefined}
          loading={props.loading ?? "lazy"}
          decoding={props.decoding ?? "async"}
          style={imageStyle}
          className={cn(
            BASE_IMAGE_CLASS,
            squareSize ? "object-cover" : "object-contain",
            className,
          )}
        />
      </button>

      {mounted && isVisible
        ? createPortal(
            <button
              type="button"
              className={cn(
                "fixed inset-0 z-[120] border-0 bg-black/0 p-0 transition-colors",
                isDarkBackdrop
                  ? "bg-black/72 backdrop-blur-[1px]"
                  : "bg-black/0",
              )}
              style={{ transitionDuration: `${TRANSITION_MS}ms` }}
              onClick={closePreview}
              aria-label="关闭图片预览"
            >
              {/* biome-ignore lint/performance/noImgElement: preview overlay requires native img with source from markdown */}
              <img
                src={src}
                alt={alt}
                className="fixed h-auto w-auto cursor-zoom-out object-contain shadow-2xl transition-[left,top,width,height] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  transitionDuration: `${TRANSITION_MS}ms`,
                }}
              />
            </button>,
            document.body,
          )
        : null}
    </>
  );
}
