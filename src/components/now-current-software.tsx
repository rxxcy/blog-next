"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { NowSoftwareIcon } from "@/lib/now-current-software";
import {
  getRandomSwitchDelay,
  getSoftwareTransitionDuration,
  pickNextSoftwareIndex,
  shouldAnimateSoftwareSwitch,
} from "@/lib/now-current-software";

type NowCurrentSoftwareProps = {
  icons: NowSoftwareIcon[];
};

function DefaultSoftwareIcon() {
  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <div className="flex h-11 w-11 items-center justify-center text-foreground">
        <div className="font-mono text-[2rem] font-semibold leading-none tracking-[-0.1em]">
          C
        </div>
      </div>
      <span className="font-mono text-xs text-muted-foreground">Cursor</span>
    </div>
  );
}

type SoftwareLayerProps = {
  icon: NowSoftwareIcon;
  visible: boolean;
  transitionDurationMs: number;
};

function SoftwareIconLayer({
  icon,
  visible,
  transitionDurationMs,
}: SoftwareLayerProps) {
  return (
    <div
      className={`absolute inset-0 transition-opacity motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${transitionDurationMs}ms` }}
    >
      <Image
        src={icon.src}
        alt={`${icon.label} icon`}
        fill
        sizes="44px"
        className="object-contain"
      />
    </div>
  );
}

function SoftwareLabelLayer({
  icon,
  visible,
  transitionDurationMs,
}: SoftwareLayerProps) {
  return (
    <span
      className={`absolute inset-0 whitespace-nowrap font-mono text-xs text-muted-foreground transition-opacity motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${transitionDurationMs}ms` }}
    >
      {icon.label}
    </span>
  );
}

export function NowCurrentSoftware({ icons }: NowCurrentSoftwareProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionIndex, setTransitionIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimateSoftwareSwitch(icons.length)) {
      setCurrentIndex(0);
      setTransitionIndex(null);
      setIsTransitioning(false);
      return;
    }

    setCurrentIndex(() => Math.floor(Math.random() * icons.length));
    setTransitionIndex(null);
    setIsTransitioning(false);

    let switchTimeoutId = 0;
    let transitionTimeoutId = 0;
    const transitionDurationMs = getSoftwareTransitionDuration();

    const scheduleNextSwitch = () => {
      switchTimeoutId = window.setTimeout(() => {
        setCurrentIndex((current) => {
          const nextIndex = pickNextSoftwareIndex(icons.length, current);

          if (prefersReducedMotion) {
            scheduleNextSwitch();
            return nextIndex;
          }

          setTransitionIndex(nextIndex);
          setIsTransitioning(true);

          transitionTimeoutId = window.setTimeout(() => {
            setCurrentIndex(nextIndex);
            setTransitionIndex(null);
            setIsTransitioning(false);
            scheduleNextSwitch();
          }, transitionDurationMs);

          return current;
        });
      }, getRandomSwitchDelay());
    };

    scheduleNextSwitch();

    return () => {
      window.clearTimeout(switchTimeoutId);
      window.clearTimeout(transitionTimeoutId);
    };
  }, [icons, prefersReducedMotion]);

  const currentIcon = icons[currentIndex];
  const transitionIcon =
    transitionIndex === null ? null : (icons[transitionIndex] ?? null);
  const labelWidthText =
    transitionIcon &&
    transitionIcon.label.length > (currentIcon?.label.length ?? 0)
      ? transitionIcon.label
      : currentIcon?.label;
  const transitionDurationMs = getSoftwareTransitionDuration();

  if (!currentIcon) {
    return <DefaultSoftwareIcon />;
  }

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <div className="relative h-11 w-11 overflow-hidden">
        <SoftwareIconLayer
          icon={currentIcon}
          visible={!isTransitioning}
          transitionDurationMs={transitionDurationMs}
        />
        {transitionIcon ? (
          <SoftwareIconLayer
            icon={transitionIcon}
            visible={isTransitioning}
            transitionDurationMs={transitionDurationMs}
          />
        ) : null}
      </div>
      <div className="relative h-4 min-w-[4rem]">
        <span
          aria-hidden="true"
          className="invisible whitespace-nowrap font-mono text-xs"
        >
          {labelWidthText}
        </span>
        <SoftwareLabelLayer
          icon={currentIcon}
          visible={!isTransitioning}
          transitionDurationMs={transitionDurationMs}
        />
        {transitionIcon ? (
          <SoftwareLabelLayer
            icon={transitionIcon}
            visible={isTransitioning}
            transitionDurationMs={transitionDurationMs}
          />
        ) : null}
      </div>
    </div>
  );
}
