"use client";

import {useEffect} from "react";

function isStoredDark() {
  try {
    const stored = localStorage.getItem("theme");
    return stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
  } catch {
    return false;
  }
}

function applyTheme() {
  const root = document.documentElement;
  const dark = isStoredDark();
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
}

export function ThemeNavGuard() {
  useEffect(() => {
    const onClick = (event) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      const anchor = event.target.closest("a[href]");
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href") || "";
      if (
        !href ||
        href.startsWith("#") ||
        anchor.hasAttribute("download") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) {
          return;
        }
      } catch {
        return;
      }

      // Apply stored theme synchronously BEFORE the document swap.
      // Next.js App Router preserves <html> across navigations, so the class
      // survives.
      applyTheme();
    };

    document.addEventListener("click", onClick, true);

    // React re-applies its own <html> className during route transitions,
    // which strips the imperative theme class until the next effect run.
    // Re-assert it immediately (before the next paint) so no light frame
    // shows for dark-mode users.
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      if (!root.classList.contains("dark") && !root.classList.contains("light")) {
        applyTheme();
      }
    });
    observer.observe(root, {attributes: true, attributeFilter: ["class"]});

    return () => {
      document.removeEventListener("click", onClick, true);
      observer.disconnect();
    };
  }, []);

  return null;
}