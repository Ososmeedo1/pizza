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

export function ThemeFix() {
  useEffect(() => {
    try {
      applyTheme();
    } catch (error) {
      console.error("Theme reapply error:", error);
    }

    // Safety net that keeps the theme marker applied even if a route
    // transition rewrites <html> className, plus hard reloads.
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      if (!root.classList.contains("dark") && !root.classList.contains("light")) {
        applyTheme();
      }
    });
    observer.observe(root, {attributes: true, attributeFilter: ["class"]});

    return () => observer.disconnect();
  }, []);

  return null;
}