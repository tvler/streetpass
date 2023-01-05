import {
  getUncachedProfileData,
  getRelMeHrefDataStore,
  SEND_REL_ME_HREF,
  getProfiles,
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

  await getRelMeHrefDataStore((profiles) => {
    console.table(
      Object.fromEntries(
        Array.from(profiles.entries()).map(([key, val]) => {
          return [
            key,
            val.profileData.type === "profile"
              ? val.profileData.profileUrl
              : val.profileData.type,
          ];
        })
      ),
      ["profileData"]
    );
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  const relMeHrefStorageChange = changes[getRelMeHrefDataStore.storageKey];
  if (!relMeHrefStorageChange) {
    return;
  }

  const oldRelMeHrefDataStore = getRelMeHrefDataStore.parse(
    relMeHrefStorageChange.oldValue
  );

  const newRelMeHrefDataStore = getRelMeHrefDataStore.parse(
    relMeHrefStorageChange.newValue
  );

  const oldProfiles = getProfiles(oldRelMeHrefDataStore);
  const newProfiles = getProfiles(newRelMeHrefDataStore);

  if (oldProfiles.size !== newProfiles.size) {
    chrome.action.setIcon({ path: "icon-active.png" });
  }
});
