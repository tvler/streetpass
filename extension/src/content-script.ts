/* eslint-env browser */

import type { Message } from "./util/constants.js";

function getCurrentUrlSanitized() {
  const url = new URL(window.location.toString());

  // Delete hash
  url.hash = "";

  // Delete UTM parameters https://en.wikipedia.org/wiki/UTM_parameters#UTM_parameters
  url.searchParams.delete("utm_source");
  url.searchParams.delete("utm_medium");
  url.searchParams.delete("utm_campaign");
  url.searchParams.delete("utm_term");
  url.searchParams.delete("utm_content");

  // Delete yahoo trackers https://github.com/brave/adblock-lists/blob/8f7dc332e813e836579ecc6a8eca3ef8e84eede8/brave-lists/clean-urls.json#L408-L410
  url.searchParams.delete("guccounter");
  url.searchParams.delete("guce_referrer");
  url.searchParams.delete("guce_referrer_sig");

  return url.toString();
}

let currentUrlSanitized = getCurrentUrlSanitized();
const hrefs: Set<string> = new Set();

function sendHrefs() {
  const elements = document.querySelectorAll(":is(link, a)[rel~=me]");

  for (const element of elements) {
    const href = element.getAttribute("href");
    if (href && !hrefs.has(href)) {
      hrefs.add(href);

      const message: Message = {
        name: "HREF_PAYLOAD",
        args: {
          tabUrl: currentUrlSanitized,
          relMeHref: href,
        },
      };
      browser.runtime.sendMessage(message);
    }
  }
}

new MutationObserver(() => {
  const testCurrentUrlSanitized = getCurrentUrlSanitized();
  if (currentUrlSanitized !== testCurrentUrlSanitized) {
    currentUrlSanitized = testCurrentUrlSanitized;
    hrefs.clear();
  }

  sendHrefs();
}).observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributeFilter: ["rel"],
});

sendHrefs();
