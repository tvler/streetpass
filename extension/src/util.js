export const SEND_REL_ME_HREF = "SEND_REL_ME_HREF";

/**
 * @typedef {{ [SEND_REL_ME_HREF]: {relMeHref: string, tabUrl: string}}} SendRelMeHrefPayload
 * @typedef {{ type: 'profile', profileUrl: string }} Profile
 * @typedef {{ type: 'notProfile' }} NotProfile
 * @typedef {Profile | NotProfile} ProfileData
 * @typedef {{
 *   profileData: ProfileData,
 *   websiteUrl: string,
 *   viewedAt: number,
 *   relMeHref: string,
 * }} RelMeHrefDataStoreValue
 * @typedef {Map<string, RelMeHrefDataStoreValue>} RelMeHrefDataStore
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
 * @param {RelMeHrefDataStore} relMeHrefDataStore
 * @returns {Map<string, {profileData: Profile;} & RelMeHrefDataStoreValue>}
 */
export function getProfiles(relMeHrefDataStore) {
  /**
   * @type {Map<string, { profileData: Profile } & RelMeHrefDataStoreValue>}
   */
  const profiles = new Map();

  for (const relMeHrefData of Array.from(
    relMeHrefDataStore.values()
  ).reverse()) {
    if (relMeHrefData.profileData.type !== "profile") {
      continue;
    }
    profiles.set(relMeHrefData.profileData.profileUrl, {
      profileData: {
        type: relMeHrefData.profileData.type,
        profileUrl: relMeHrefData.profileData.profileUrl,
      },
      websiteUrl: relMeHrefData.websiteUrl,
      viewedAt: relMeHrefData.viewedAt,
      relMeHref: relMeHrefData.relMeHref,
    });
  }

  return profiles;
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

/**
 * @type {<T>(args: {
 *   parse(storageData: any): T
 *   serialize(data: T): any
 *   storageKey: string
 *   onChange?(args: {prev: T, curr: T}): (void | Promise<void>)
 * }) => ({
 *   (cb: (data: Readonly<T>) => (void | T)): Promise<void>}
 * )}
 */
export function storageFactory(args) {
  let lastDataPromise = Promise.resolve();

  return (cb) => {
    const oldLastDataPromise = lastDataPromise;
    lastDataPromise = new Promise((res) => {
      oldLastDataPromise.then(async () => {
        try {
          const storageData = (
            await browser.storage.local.get(args.storageKey)
          )?.[args.storageKey];

          const data = args.parse(storageData);

          const cbResult = cb(data);

          if (cbResult !== undefined) {
            await browser.storage.local.set({
              [args.storageKey]: args.serialize(cbResult),
            });
            await args.onChange?.({
              prev: args.parse(storageData),
              curr: cbResult,
            });
          }
        } catch (err) {
          // Nothing
        }

        res();
      });
    });

    return lastDataPromise;
  };
}

export const getIconState = storageFactory({
  storageKey: "icon-state-3",
  parse(storageData) {
    /** @type {{state: 'on' | 'off', unreadCount?: number}} */
    const iconState = storageData ?? { state: "off" };
    return iconState;
  },
  serialize(iconState) {
    return iconState;
  },
  onChange({ prev, curr }) {
    const path =
      curr.state === "off" ? "/action-inactive.png" : "/action-active.png";
    const badgeText = curr.unreadCount ? `+${curr.unreadCount}` : "";

    browser.action.setIcon({
      path: path,
    });

    browser.action.setBadgeBackgroundColor({ color: "#9f99f5" });
    // browser.action.setBadgeBackgroundColor({ color: "#5F55EC" });

    browser.action.setBadgeText({ text: badgeText });
  },
});

export const getRelMeHrefDataStore = storageFactory({
  storageKey: "rel-me-href-data-store-3",
  parse(storageData) {
    /** @type {RelMeHrefDataStore} */
    let relMeHrefDataStore;
    try {
      relMeHrefDataStore = new Map(storageData);
    } catch (err) {
      relMeHrefDataStore = new Map();
    }
    return relMeHrefDataStore;
  },
  serialize(relMeHrefDataStore) {
    return Array.from(relMeHrefDataStore.entries());
  },
  async onChange({ prev, curr }) {
    const prevProfiles = getProfiles(prev);
    const currProfiles = getProfiles(curr);
    if (currProfiles.size > prevProfiles.size) {
      getIconState((iconState) => ({
        state: "on",
        unreadCount:
          (iconState.unreadCount ?? 0) +
          (currProfiles.size - prevProfiles.size),
      }));
    }
  },
});

/**
 * Test the safe storage
 */
// {
//   const getInc = storageFactory({
//     storageKey: "inc2",
//     parse(storageData) {
//       /** @type {number} */
//       let num;
//       if (typeof storageData === "number" && !isNaN(storageData)) {
//         num = storageData;
//       } else {
//         num = 0;
//       }
//       return num;
//     },
//     serialize(inc) {
//       return inc;
//     },
//   });

//   chrome.runtime.onMessage.addListener(async () => {
//     /**
//      * @param {number} sleepMs
//      * @returns {Promise<void>}
//      */
//     function sleep(sleepMs) {
//       return new Promise((res) => {
//         setTimeout(() => {
//           res();
//         }, sleepMs);
//       });
//     }

//     getInc((inc) => {
//       console.log(inc, inc === 0);
//       return inc + 1;
//     });
//     getInc((inc) => {
//       console.log(inc, inc === 1);
//       return inc + 1;
//     });
//     await getInc((inc) => {
//       console.log(inc, inc === 2);
//       return inc + 1;
//     });
//     getInc((inc) => {
//       console.log(inc, inc === 3);
//       return inc + 1;
//     });
//     console.log("sleep");
//     await sleep(1000);
//     console.log("wakeup");
//     getInc((inc) => {
//       console.log(inc, inc === 4);
//       return inc + 1;
//     });
//     getInc((inc) => {
//       console.log(inc, inc === 5);
//       return inc + 1;
//     });
//     await getInc((inc) => {
//       console.log(inc, inc === 6);
//       return inc + 1;
//     });
//     getInc((inc) => {
//       console.log(inc, inc === 7);
//     });
//   });
// }
