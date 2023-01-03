export const SEND_REL_ME_HREF = "SEND_REL_ME_HREF";

/**
 * @typedef {{ [SEND_REL_ME_HREF]: {relMeHref: string, tabUrl: string}}} SendRelMeHrefPayload
 * @typedef {{ type: 'profile', profileUrl: string }} Profile
 * @typedef {{ type: 'notProfile' }} NotProfile
 * @typedef {Profile | NotProfile} ProfileData
 * @typedef {Map<string, { profileData: ProfileData, websiteUrl: string, viewedAt: number }>} RelMeHrefDataStore
 * @typedef {{
 *   subject: string,
 *   aliases?: Array<string>
 *   properties?: Record<string, string>
 *   links?: Array<{
 *     rel: string
 *     type?: string
 *     href?: string
 *     titles?: Record<string, string>
 *     properties?: Record<string, string>
 *   }>
 * }} Webfinger https://webfinger.net/spec/
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
  const REL_ME_HREF_DATA_STORE_STORAGE_KEY = "profiles27";

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
 */
function getIsRelWebfingerProfilePageRel(href) {
  const webFingerProfilePageRelWithoutProtocol =
    "//webfinger.net/rel/profile-page";

  return (
    href === `http:${webFingerProfilePageRelWithoutProtocol}` ||
    href === `https:${webFingerProfilePageRelWithoutProtocol}`
  );
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

    /**
     * @type {Webfinger}
     */
    const webfinger = await webfingerResp.json();
    for (const webfingerLink of webfinger.links ?? []) {
      if (
        getIsRelWebfingerProfilePageRel(webfingerLink.rel) &&
        !!webfingerLink.href
      ) {
        return {
          type: "profile",
          profileUrl: webfingerLink.href,
        };
      }
    }
  } catch (err) {
    // Nothing
  }

  return { type: "notProfile" };
}

/**
 * @param {string} href
 * @returns {string}
 */
export function getDisplayHref(href) {
  /**
   * @type {URL}
   */
  let url;
  try {
    url = new URL(href);
  } catch (err) {
    return href;
  }

  let pathnameWithStrippedTrailingSlash = url.pathname;
  const trailingSlash = "/";
  if (pathnameWithStrippedTrailingSlash.endsWith(trailingSlash)) {
    pathnameWithStrippedTrailingSlash = pathnameWithStrippedTrailingSlash.slice(
      0,
      -trailingSlash.length
    );
  }

  let strippedUrl = `${url.host}${pathnameWithStrippedTrailingSlash}${url.search}`;

  const wwwDot = "www.";
  if (strippedUrl.startsWith(wwwDot)) {
    strippedUrl = strippedUrl.slice(wwwDot.length);
  }

  return strippedUrl;
}

/**
 * @param {number} ms
 * @returns {string}
 */
export function getRelativeTime(ms) {
  /**
   * @type {Map<Intl.RelativeTimeFormatUnit, number>}
   */
  const units = new Map([
    ["year", 24 * 60 * 60 * 1000 * 365],
    ["month", (24 * 60 * 60 * 1000 * 365) / 12],
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
  ]);

  // ["minute", 60 * 1000],

  var rtf = new Intl.RelativeTimeFormat("en", {
    numeric: "always", // other values: "auto"
    style: "short", // other values: "short" or "narrow"
  });

  /**
   * @type {Intl.RelativeTimeFormatUnit}
   */
  let chosenUnit = "minute";
  for (var [unit, unitValueMs] of units) {
    if (Math.abs(ms) > unitValueMs) {
      chosenUnit = unit;
      break;
    }
  }

  const parts = rtf.formatToParts(
    -Math.round(ms / (units.get(chosenUnit) ?? 60 * 1000)),
    chosenUnit
  );

  const stringStart = " ";
  const stringEnd = ". ago";
  let returnString = "";
  for (const part of parts) {
    let stringToAdd = part.value;
    if (stringToAdd.startsWith(stringStart)) {
      stringToAdd = stringToAdd.slice(stringStart.length);
    }
    if (stringToAdd.endsWith(stringEnd)) {
      stringToAdd = stringToAdd.slice(0, -stringEnd.length);
    }

    returnString += stringToAdd;
  }

  return returnString;
}
