import {
  getUncachedProfileData,
  getRelMeHrefDataStore,
  SEND_REL_ME_HREF,
} from "./util.js";

chrome.runtime.onMessage.addListener(async (msg, sender, sendResp) => {
  if (
    !msg ||
    typeof msg !== "object" ||
    !(SEND_REL_ME_HREF in msg) ||
    !msg[SEND_REL_ME_HREF]
  ) {
    return;
  }

  /**
   * @type {import('./util.js').SendRelMeHrefPayload['SEND_REL_ME_HREF']}
   */
  const sendRelMeHrefPayload = msg[SEND_REL_ME_HREF];

  /**
   * @type {import("./util.js").ProfileData | undefined}
   */
  let profileData;

  await getRelMeHrefDataStore((relMeHrefDataStore) => {
    profileData = relMeHrefDataStore.get(
      sendRelMeHrefPayload.relMeHref
    )?.profileData;
  });

  if (!profileData) {
    console.log("🦺getProfileData uncached", sendRelMeHrefPayload.relMeHref);
    profileData = await getUncachedProfileData(sendRelMeHrefPayload.relMeHref);
  }

  await getRelMeHrefDataStore((relMeHrefDataStore) => {
    if (!profileData) {
      return;
    }

    relMeHrefDataStore.delete(sendRelMeHrefPayload.relMeHref);
    relMeHrefDataStore.set(sendRelMeHrefPayload.relMeHref, {
      profileData: profileData,
      viewedAt: Date.now(),
      websiteUrl: sendRelMeHrefPayload.tabUrl,
    });

    return relMeHrefDataStore;
  });

  await getRelMeHrefDataStore((profiles) => {
    console.table(Object.fromEntries(profiles.entries()), ["type"]);
  });
});
