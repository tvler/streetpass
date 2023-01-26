import "webextension-polyfill";
import {
  getUncachedProfileData,
  getRelMeHrefDataStore,
  SEND_REL_ME_HREF,
  getIconState,
} from "./util.js";

browser.runtime.onMessage.addListener(async (msg, sender, sendResp) => {
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
   * @type {boolean | undefined}
   */
  let hasExistingRelMeHrefData;
  await getRelMeHrefDataStore((relMeHrefDataStore) => {
    hasExistingRelMeHrefData = relMeHrefDataStore.has(
      sendRelMeHrefPayload.relMeHref
    );
  });
  if (hasExistingRelMeHrefData) {
    return;
  }

  /**
   * @type {import("./util.js").ProfileData | undefined}
   */
  let profileData = await getUncachedProfileData(
    sendRelMeHrefPayload.relMeHref
  );

  await getRelMeHrefDataStore((relMeHrefDataStore) => {
    if (!profileData) {
      return;
    }

    relMeHrefDataStore.set(sendRelMeHrefPayload.relMeHref, {
      profileData: profileData,
      viewedAt: Date.now(),
      websiteUrl: sendRelMeHrefPayload.tabUrl,
      relMeHref: sendRelMeHrefPayload.relMeHref,
    });

    return relMeHrefDataStore;
  });

  // getRelMeHrefDataStore((profiles) => {
  //   console.table(
  //     Object.fromEntries(
  //       Array.from(profiles.entries()).map(([key, val]) => {
  //         return [
  //           key,
  //           val.profileData.type === "profile"
  //             ? val.profileData.profileUrl
  //             : val.profileData.type,
  //         ];
  //       })
  //     ),
  //     ["profileData"]
  //   );
  // });
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
