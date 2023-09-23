import { removeSubstring } from "./removeSubstring";

export function getDisplayHref(href: string): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch (err) {
    return href;
  }

  const strippedUrl =
    removeSubstring(url.host, "www.", 0).value +
    removeSubstring(url.pathname, "/", -1).value +
    url.search;

  return strippedUrl;
}
