export const SEND_REL_ME_HREF = "SEND_REL_ME_HREF";

/**
 * @typedef {{ [SEND_REL_ME_HREF]: {relMeHref: string, tabUrl: string}}} SendRelMeHrefPayload
 * @typedef {{ type: 'profile', profileUrl: string }} Profile
 * @typedef {{ type: 'notProfile' }} NotProfile
 * @typedef {Profile | NotProfile} ProfileData
 * @typedef {Map<string, { profileData: ProfileData, websiteUrl: string, viewedAt: number }>} RelMeHrefDataStore
 */

/**
 * @param {string | undefined} uncheckedUrl
 * @returns {boolean}
 */
export function getIsUrlHttpOrHttps(uncheckedUrl) {
  if (!uncheckedUrl) {
    return false;
  }

  /**
   * @type {URL}
   */
  let url;
  try {
    url = new URL(uncheckedUrl);
  } catch (err) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * @type {Promise<void>}
 */
let lastRelMeHrefDataStorePromise = Promise.resolve();
/**
 * @param {(relMeHrefDataStore: RelMeHrefDataStore) => (void | RelMeHrefDataStore | Promise<void | RelMeHrefDataStore>)} cb
 */
export async function getRelMeHrefDataStore(cb) {
  const REL_ME_HREF_DATA_STORE_STORAGE_KEY = "profiles21";

  const oldLastRelMeHrefDataStorePromise = lastRelMeHrefDataStorePromise;
  lastRelMeHrefDataStorePromise = new Promise((res) => {
    oldLastRelMeHrefDataStorePromise.then(async () => {
      try {
        /**
         * @type {RelMeHrefDataStore}
         */
        let relMeHrefDataStore;
        try {
          const relMeHrefDataStoreArray =
            (
              await chrome.storage.local.get(REL_ME_HREF_DATA_STORE_STORAGE_KEY)
            )?.[REL_ME_HREF_DATA_STORE_STORAGE_KEY] ?? [];

          relMeHrefDataStore = new Map(relMeHrefDataStoreArray);
        } catch (err) {
          relMeHrefDataStore = new Map();
        }

        const callbackResult = await cb(relMeHrefDataStore);

        if (callbackResult) {
          await chrome.storage.local.set({
            [REL_ME_HREF_DATA_STORE_STORAGE_KEY]: Array.from(
              callbackResult.entries()
            ),
          });
        }
      } catch (err) {
        // Nothing
      }

      res();
    });
  });
  return lastRelMeHrefDataStorePromise;
}

/**
 * @param {string} href
 * @returns {Promise<ProfileData>}
 */
export async function getUncachedProfileData(href) {
  try {
    if (!getIsUrlHttpOrHttps(href)) {
      throw new Error();
    }

    const visitedRelMeHrefResp = await fetch(href);
    if (!visitedRelMeHrefResp.ok) {
      throw new Error();
    }

    const visitedRelMeUrl = new URL(visitedRelMeHrefResp.url);

    const webfingerUrl = new URL(visitedRelMeUrl.origin);
    webfingerUrl.pathname = ".well-known/webfinger";
    webfingerUrl.searchParams.set("resource", visitedRelMeUrl.toString());

    const webfingerResp = await fetch(webfingerUrl);
    if (!webfingerResp.ok) {
      throw new Error();
    }

    await webfingerResp.json();

    return {
      type: "profile",
      profileUrl: visitedRelMeUrl.toString(),
    };
  } catch (err) {
    return {
      type: "notProfile",
    };
  }
}
