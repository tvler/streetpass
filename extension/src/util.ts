export const SEND_REL_ME_HREF = "SEND_REL_ME_HREF";

export type SendRelMeHrefPayload = {
  [SEND_REL_ME_HREF]: { relMeHref: string; tabUrl: string };
};

type Profile = { type: "profile"; profileUrl: string };

type NotProfile = { type: "notProfile" };

type ProfileData = Profile | NotProfile;

type RelMeHrefDataStoreValue = {
  profileData: ProfileData;
  websiteUrl: string;
  viewedAt: number;
  relMeHref: string;
};

export type RelMeHrefDataStore = Map<string, RelMeHrefDataStoreValue>;

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
  relMeHrefDataStore: RelMeHrefDataStore
): Map<string, { profileData: Profile } & RelMeHrefDataStoreValue> {
  const profiles: Map<
    string,
    { profileData: Profile } & RelMeHrefDataStoreValue
  > = new Map();

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

function getIsRelWebfingerProfilePageRel(href: string) {
  const webFingerProfilePageRelWithoutProtocol =
    "//webfinger.net/rel/profile-page";

  return (
    href === `http:${webFingerProfilePageRelWithoutProtocol}` ||
    href === `https:${webFingerProfilePageRelWithoutProtocol}`
  );
}

export async function getUncachedProfileData(
  href: string
): Promise<ProfileData> {
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

export function storageFactory<T>(args: {
  parse(storageData: any): T;
  serialize(data: T): any;
  storageKey: string;
  onChange?(args: { prev: T; curr: T }): void | Promise<void>;
}): {
  (cb: (data: Readonly<T>) => void | T): Promise<void>;
} {
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
    const iconState: { state: "on" | "off"; unreadCount?: number } =
      storageData ?? { state: "off" };
    return iconState;
  },
  serialize(iconState) {
    return iconState;
  },
  onChange({ prev, curr }) {
    const path =
      curr.state === "off" ? "/action-inactive.png" : "/action-active.png";
    const badgeText = curr.unreadCount ? `+${curr.unreadCount}` : "";

    const browserAction = browser.action ?? browser.browserAction;
    browserAction.setIcon({
      path: path,
    });

    browserAction.setBadgeBackgroundColor({ color: "#9f99f5" });
    // browserAction.setBadgeBackgroundColor({ color: "#5F55EC" });

    browserAction.setBadgeText({ text: badgeText });
  },
});

export const getRelMeHrefDataStore = storageFactory({
  storageKey: "rel-me-href-data-store-3",
  parse(storageData) {
    let relMeHrefDataStore: RelMeHrefDataStore;
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
