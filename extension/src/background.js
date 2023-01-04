import {
  getUncachedProfileData,
  getRelMeHrefDataStore,
  SEND_REL_ME_HREF,
  REL_ME_HREF_DATA_STORE_STORAGE_KEY,
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
  const relMeHrefStorageChange = changes[REL_ME_HREF_DATA_STORE_STORAGE_KEY];
  if (!relMeHrefStorageChange) {
    return;
  }

  /**
   * @type {import("./util.js").RelMeHrefDataStore}
   */
  let oldRelMeHrefDataStore;
  try {
    oldRelMeHrefDataStore = new Map(relMeHrefStorageChange.oldValue);
  } catch (err) {
    oldRelMeHrefDataStore = new Map();
  }

  /**
   * @type {import("./util.js").RelMeHrefDataStore}
   */
  let newRelMeHrefDataStore;
  try {
    newRelMeHrefDataStore = new Map(relMeHrefStorageChange.newValue);
  } catch (err) {
    newRelMeHrefDataStore = new Map();
  }

  const oldProfiles = getProfiles(oldRelMeHrefDataStore);
  const newProfiles = getProfiles(newRelMeHrefDataStore);

  if (oldProfiles.size !== newProfiles.size) {
    chrome.action.setIcon({ path: "icon-active.png" });
  }
});
