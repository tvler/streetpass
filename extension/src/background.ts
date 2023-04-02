import "webextension-polyfill";
import {
  getUncachedProfileData,
  getHrefStore,
  HREF_PAYLOAD,
  getIconState,
  timeToExpireNotProfile,
} from "./util.js";
import type { HrefPayload } from "./util.js";

browser.runtime.onMessage.addListener(async (msg, sender, sendResp) => {
  if (
    !msg ||
    typeof msg !== "object" ||
    !(HREF_PAYLOAD in msg) ||
    !msg[HREF_PAYLOAD]
  ) {
    return;
  }

  const hrefPayload: HrefPayload[typeof HREF_PAYLOAD] = msg[HREF_PAYLOAD];

  const hasExistingHrefData = (
    await getHrefStore((prev) => {
      const hrefStore = new Map(prev);
      for (const [key, hrefData] of hrefStore) {
        if (
          hrefData.profileData.type === "notProfile" &&
          hrefData.viewedAt + timeToExpireNotProfile < Date.now()
        ) {
          hrefStore.delete(key);
        }
      }

      return hrefStore;
    })
  ).has(hrefPayload.href);

  if (hasExistingHrefData) {
    return;
  }

  const profileData = await getUncachedProfileData(hrefPayload.href);

  await getHrefStore((hrefStore) => {
    const newHrefStore = new Map(hrefStore);
    newHrefStore.set(hrefPayload.href, {
      profileData: profileData,
      viewedAt: Date.now(),
      websiteUrl: hrefPayload.tabUrl,
      relMeHref: hrefPayload.href,
    });

    return newHrefStore;
  });
});

browser.runtime.onInstalled.addListener((details) => {
  getIconState((iconState) => {
    if (details.reason === "install") {
      return { state: "on", unreadCount: iconState.unreadCount };
    }
    return iconState;
  });
});

browser.runtime.onStartup.addListener(() => {
  // Trigger an onChange to set the correct icon
  getIconState((iconState) => iconState);
});
