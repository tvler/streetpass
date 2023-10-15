import * as React from "react";

type SystemTheme = "dark" | "light";

function getMediaQuery(): MediaQueryList {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return mediaQuery;
}

function subscribe(onStoreChange: () => void): () => void {
  const mediaQuery = getMediaQuery();
  mediaQuery.addEventListener("change", onStoreChange);
  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getSnapshot(): boolean {
  const mediaQuery = getMediaQuery();
  return mediaQuery.matches;
}

function getSystemTheme(mediaQueryMatches: boolean): SystemTheme {
  return mediaQueryMatches ? "dark" : "light";
}

export function useSystemTheme(): SystemTheme {
  return getSystemTheme(React.useSyncExternalStore(subscribe, getSnapshot));
}
