import {
  getIsUrlHttpOrHttps,
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

  if (!getIsUrlHttpOrHttps(sendRelMeHrefPayload.relMeHref)) {
    return;
  }

  /**
   * @type {string | undefined}
   */
  let profileUrl;
  await getRelMeHrefDataStore((relMeHrefDataStore) => {
    profileUrl = relMeHrefDataStore.get(
      sendRelMeHrefPayload.relMeHref
    )?.profileUrl;
  });
  if (!profileUrl) {
    try {
      const visitedRelMeHrefResp = await fetch(sendRelMeHrefPayload.relMeHref);
      if (!visitedRelMeHrefResp.ok) {
        return;
      }

      const visitedRelMeUrl = new URL(visitedRelMeHrefResp.url);

      const webfingerUrl = new URL(visitedRelMeUrl.origin);
      webfingerUrl.pathname = ".well-known/webfinger";
      webfingerUrl.searchParams.set("resource", visitedRelMeUrl.toString());

      const webfingerResp = await fetch(webfingerUrl);
      if (!webfingerResp.ok) {
        return;
      }

      await webfingerResp.json();

      profileUrl = visitedRelMeUrl.toString();
    } catch (err) {
      return;
    }
  }

  await getRelMeHrefDataStore((profiles) => {
    if (!profileUrl) {
      return;
    }

    profiles.delete(sendRelMeHrefPayload.relMeHref);
    profiles.set(sendRelMeHrefPayload.relMeHref, {
      profileUrl: profileUrl,
      websiteUrl: sendRelMeHrefPayload.tabUrl,
      viewedAt: Date.now(),
    });

    return profiles;
  });

  await getRelMeHrefDataStore((profiles) => {
    console.log("profiles");
    console.log(Array.from(profiles.keys()));
    console.log("");
  });
});
