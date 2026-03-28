"use client";

import { useRouter } from "next/navigation";

const actionLinkClass =
  "cursor-pointer border-0 bg-transparent p-0 text-[11px] leading-[15px] text-[#0000EE] underline";

export function NotFoundIeRefreshButton() {
  return (
    <button
      type="button"
      className={actionLinkClass}
      onClick={() => window.location.reload()}
    >
      Refresh
    </button>
  );
}

export function NotFoundIeDetectButton() {
  return (
    <button
      type="button"
      className={actionLinkClass}
      title="Detect Settings"
      onClick={() =>
        window.prompt(
          "Windows could not automatically discover network settings.",
          "",
        )
      }
    >
      Detect Network Settings
    </button>
  );
}

export function NotFoundIeBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={actionLinkClass}
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push("/");
      }}
    >
      Back
    </button>
  );
}
