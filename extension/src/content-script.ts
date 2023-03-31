/* eslint-env browser */

import { HREF_PAYLOAD, HrefPayload } from "./util.js";

function getCurrentUrlWithNoHash() {
  const url = new URL(window.location.toString());
  url.hash = "";
  return url.toString();
}

let currentUrlWithNoHash = getCurrentUrlWithNoHash();
const hrefs: Set<string> = new Set();

function sendHrefs() {
  const elements = document.querySelectorAll(":is(link, a)[rel~=me]");

  for (const element of elements) {
    const href = element.getAttribute("href");
    if (href && !hrefs.has(href)) {
      hrefs.add(href);

      const hrefPayload: HrefPayload = {
        [HREF_PAYLOAD]: {
          tabUrl: currentUrlWithNoHash,
          href: href,
        },
      };
      browser.runtime.sendMessage(hrefPayload);
    }
  }
}

new MutationObserver(() => {
  const testCurrentUrlWithNoHash = getCurrentUrlWithNoHash();
  if (currentUrlWithNoHash !== testCurrentUrlWithNoHash) {
    currentUrlWithNoHash = testCurrentUrlWithNoHash;
    hrefs.clear();
  }

  sendHrefs();
}).observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributeFilter: ["rel"],
});

sendHrefs();
