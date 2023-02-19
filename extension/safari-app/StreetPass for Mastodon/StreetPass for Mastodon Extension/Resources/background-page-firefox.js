import './browser-polyfill.js';
import { SEND_REL_ME_HREF, getRelMeHrefDataStore, getUncachedProfileData, getIconState } from './util.js';

browser.runtime.onMessage.addListener(async (msg, sender, sendResp) => {
  if (!msg || typeof msg !== "object" || !(SEND_REL_ME_HREF in msg) || !msg[SEND_REL_ME_HREF]) {
    return;
  }
  const sendRelMeHrefPayload = msg[SEND_REL_ME_HREF];
  console.log("background", sendRelMeHrefPayload);
  let hasExistingRelMeHrefData;
  await getRelMeHrefDataStore((relMeHrefDataStore) => {
    hasExistingRelMeHrefData = relMeHrefDataStore.has(
      sendRelMeHrefPayload.relMeHref
    );
  });
  if (hasExistingRelMeHrefData) {
    return;
  }
  const profileData = await getUncachedProfileData(
    sendRelMeHrefPayload.relMeHref
  );
  await getRelMeHrefDataStore((relMeHrefDataStore) => {
    if (!profileData) {
      return;
    }
    relMeHrefDataStore.set(sendRelMeHrefPayload.relMeHref, {
      profileData,
      viewedAt: Date.now(),
      websiteUrl: sendRelMeHrefPayload.tabUrl,
      relMeHref: sendRelMeHrefPayload.relMeHref
    });
    return relMeHrefDataStore;
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
  getIconState((iconState) => iconState);
});
