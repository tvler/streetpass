/* eslint-env browser */

import type { SendRelMeHrefPayload } from "./util.js";

function getCurrentUrlWithNoHash() {
  const url = new URL(window.location.toString());
  url.hash = "";
  return url.toString();
}

let currentUrlWithNoHash = getCurrentUrlWithNoHash();
const relMeHrefs: Set<string> = new Set();

function sendRelMeHrefs() {
  const elements = document.querySelectorAll(":is(link, a)[rel~=me]");

  for (const element of elements) {
    const relMeHref = element.getAttribute("href");
    if (relMeHref && !relMeHrefs.has(relMeHref)) {
      relMeHrefs.add(relMeHref);

      const sendRelMeHrefPayload: SendRelMeHrefPayload = {
        SEND_REL_ME_HREF: {
          tabUrl: currentUrlWithNoHash,
          relMeHref: relMeHref,
        },
      };
      browser.runtime.sendMessage(sendRelMeHrefPayload);
    }
  }
}

new MutationObserver(() => {
  const testCurrentUrlWithNoHash = getCurrentUrlWithNoHash();
  if (currentUrlWithNoHash !== testCurrentUrlWithNoHash) {
    currentUrlWithNoHash = testCurrentUrlWithNoHash;
    relMeHrefs.clear();
  }

  sendRelMeHrefs();
}).observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributeFilter: ["rel"],
});

sendRelMeHrefs();
