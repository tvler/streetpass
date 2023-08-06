import type { DeepReadonly } from "ts-essentials";
import { stringify } from "csv-stringify/browser/esm/sync";

/**
 * =========
 * CONSTANTS
 * =========
 */

export const HREF_PAYLOAD = "HREF_PAYLOAD";

export type HrefPayload = {
  [HREF_PAYLOAD]: { href: string; tabUrl: string };
};

export type Target = "chrome" | "firefox" | "safari";

type Profile = { type: "profile"; profileUrl: string };

type NotProfile = { type: "notProfile" };

type ProfileData = Profile | NotProfile;

type NotNullNotUndefined = {};

type HrefData = {
  profileData: ProfileData;
  websiteUrl: string;
  viewedAt: number;
  relMeHref: string;
};

export type HrefStore = Map<string, HrefData>;

type Webfinger = {
  subject: string;
  aliases?: Array<string>;
  properties?: Record<string, string>;
  links?: Array<{
    rel: string;
    type?: string;
    href?: string;
    titles?: Record<string, string>;
    properties?: Record<string, string>;
  }>;
};

export const actionInactive = {
  "16": "/action-inactive-16.png",
  "19": "/action-inactive-19.png",
  "32": "/action-inactive-32.png",
  "38": "/action-inactive-38.png",
} as const satisfies Record<string, string>;

export const actionActive = {
  "16": "/action-active-16.png",
  "19": "/action-active-19.png",
  "32": "/action-active-32.png",
  "38": "/action-active-38.png",
} as const satisfies Record<string, string>;

export const timeToExpireNotProfile = 10 * 60 * 1000; // 10 min in milliseconds

/**
 * =====
 * UTILS
 * =====
 */

export function getIsUrlHttpOrHttps(uncheckedUrl: string | undefined): boolean {
  if (!uncheckedUrl) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(uncheckedUrl);
  } catch (err) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export function getProfiles(
  hrefStore: DeepReadonly<HrefStore>,
): Map<string, { profileData: Profile } & HrefData> {
  const profiles: Map<string, { profileData: Profile } & HrefData> = new Map();

  for (const hrefData of Array.from(hrefStore.values()).reverse()) {
    if (hrefData.profileData.type !== "profile") {
      continue;
    }
    profiles.set(hrefData.profileData.profileUrl, {
      profileData: {
        type: hrefData.profileData.type,
        profileUrl: hrefData.profileData.profileUrl,
      },
      websiteUrl: hrefData.websiteUrl,
      viewedAt: hrefData.viewedAt,
      relMeHref: hrefData.relMeHref,
    });
  }

  return profiles;
}

function getIsRelWebfingerProfilePageRel(href: string) {
  const webFingerProfilePageRelWithoutProtocol =
    "//webfinger.net/rel/profile-page";

  return (
    href === `http:${webFingerProfilePageRelWithoutProtocol}` ||
    href === `https:${webFingerProfilePageRelWithoutProtocol}`
  );
}

export async function getUncachedProfileData(
  href: string,
): Promise<ProfileData> {
  try {
    if (!getIsUrlHttpOrHttps(href)) {
      throw new Error();
    }

    if (href.startsWith("https://twitter.com")) {
      throw new Error();
    }

    if (href.startsWith("https://instagram.com")) {
      throw new Error();
    }

    if (href.startsWith("https://github.com")) {
      throw new Error();
    }

    const visitedHrefResp = await fetch(href);
    if (!visitedHrefResp.ok) {
      throw new Error();
    }

    const visitedUrl = new URL(visitedHrefResp.url);

    const webfingerUrl = new URL(visitedUrl.origin);
    webfingerUrl.pathname = ".well-known/webfinger";
    webfingerUrl.searchParams.set("resource", visitedUrl.toString());

    const webfingerResp = await fetch(webfingerUrl);
    if (!webfingerResp.ok) {
      throw new Error();
    }

    const webfinger: Webfinger = await webfingerResp.json();
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

export function getDisplayHref(href: string): string {
  let url: URL;
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
      -trailingSlash.length,
    );
  }

  let strippedUrl = `${url.host}${pathnameWithStrippedTrailingSlash}${url.search}`;

  const wwwDot = "www.";
  if (strippedUrl.startsWith(wwwDot)) {
    strippedUrl = strippedUrl.slice(wwwDot.length);
  }

  return strippedUrl;
}

export function storageFactory<T extends NotNullNotUndefined>(args: {
  parse(storageData: any): DeepReadonly<T>;
  serialize(data: DeepReadonly<T>): any;
  storageKey: string;
  onChange?(args: {
    prev: DeepReadonly<T>;
    curr: DeepReadonly<T>;
  }): void | Promise<void>;
}): {
  (cb?: (data: DeepReadonly<T>) => DeepReadonly<T>): Promise<DeepReadonly<T>>;
} {
  let lastDataPromise: Promise<DeepReadonly<T>> = Promise.resolve(
    args.parse(undefined),
  );

  return (cb) => {
    const oldLastDataPromise = lastDataPromise;
    lastDataPromise = new Promise((res) => {
      oldLastDataPromise.then(async (oldValue) => {
        try {
          const storageData = (
            await browser.storage.local.get(args.storageKey)
          )?.[args.storageKey];

          const data = args.parse(storageData);
          const changedData = cb?.(data);

          if (changedData !== undefined) {
            await Promise.all([
              browser.storage.local.set({
                [args.storageKey]: args.serialize(changedData),
              }),
              args.onChange?.({
                prev: data,
                curr: changedData,
              }),
            ]);
          }

          res(changedData ?? data);
        } catch (err) {
          res(oldValue);
        }
      });
    });

    return lastDataPromise;
  };
}

export const getIconState = storageFactory({
  storageKey: "icon-state-3",
  parse(storageData) {
    const iconState: { state: "on" | "off"; unreadCount?: number | undefined } =
      storageData ?? { state: "off" };
    return iconState;
  },
  serialize(iconState) {
    return iconState;
  },
  onChange({ prev, curr }) {
    /**
     * Firefox is still at manifest v2
     */
    const browserAction =
      __TARGET__ === "firefox" ? browser.browserAction : browser.action;

    /**
     * Safari can't render grayed out icon
     */
    if (__TARGET__ !== "safari") {
      const path = curr.state === "off" ? actionInactive : actionActive;

      browserAction.setIcon({
        path: path,
      });
    }

    browserAction.setBadgeBackgroundColor({ color: "#9f99f5" });

    const badgeText = curr.unreadCount ? `+${curr.unreadCount}` : "";
    browserAction.setBadgeText({ text: badgeText });
  },
});

export const getHrefStore = storageFactory({
  storageKey: "rel-me-href-data-store-3",
  parse(storageData) {
    let hrefStore: HrefStore;
    try {
      hrefStore = new Map(storageData);
    } catch (err) {
      hrefStore = new Map();
    }
    return hrefStore;
  },
  serialize(hrefStore) {
    return Array.from(hrefStore.entries());
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
 * Note: need to get username. not profileUrl
 */
export async function exportProfiles() {
  const profiles = Array.from(getProfiles(await getHrefStore()).values()).map(
    (profile) => [profile.profileData.profileUrl, "true", "false"],
  );
  const csvText = stringify([
    ["Account address", "Show boosts", "Notify on new posts", "Languages"],
    ...profiles,
  ]);
  const link = document.createElement("a");
  link.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvText),
  );
  link.setAttribute("download", "streetpass.csv");
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Test the safe storage
 */
// {
//   const getInc = storageFactory({
//     storageKey: "inc2",
//     parse(storageData) {
//       let num: number;
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
