const SEND_REL_ME_HREF = "SEND_REL_ME_HREF";
function getIsUrlHttpOrHttps(uncheckedUrl) {
  if (!uncheckedUrl) {
    return false;
  }
  let url;
  try {
    url = new URL(uncheckedUrl);
  } catch (err) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
function getProfiles(relMeHrefDataStore) {
  const profiles = /* @__PURE__ */ new Map();
  for (const relMeHrefData of Array.from(
    relMeHrefDataStore.values()
  ).reverse()) {
    if (relMeHrefData.profileData.type !== "profile") {
      continue;
    }
    profiles.set(relMeHrefData.profileData.profileUrl, {
      profileData: {
        type: relMeHrefData.profileData.type,
        profileUrl: relMeHrefData.profileData.profileUrl
      },
      websiteUrl: relMeHrefData.websiteUrl,
      viewedAt: relMeHrefData.viewedAt,
      relMeHref: relMeHrefData.relMeHref
    });
  }
  return profiles;
}
function getIsRelWebfingerProfilePageRel(href) {
  const webFingerProfilePageRelWithoutProtocol = "//webfinger.net/rel/profile-page";
  return href === `http:${webFingerProfilePageRelWithoutProtocol}` || href === `https:${webFingerProfilePageRelWithoutProtocol}`;
}
async function getUncachedProfileData(href) {
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
    const webfinger = await webfingerResp.json();
    for (const webfingerLink of webfinger.links ?? []) {
      if (getIsRelWebfingerProfilePageRel(webfingerLink.rel) && !!webfingerLink.href) {
        return {
          type: "profile",
          profileUrl: webfingerLink.href
        };
      }
    }
  } catch (err) {
  }
  return { type: "notProfile" };
}
function getDisplayHref(href) {
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
function storageFactory(args) {
  let lastDataPromise = Promise.resolve();
  return (cb) => {
    const oldLastDataPromise = lastDataPromise;
    lastDataPromise = new Promise((res) => {
      oldLastDataPromise.then(async () => {
        try {
          const storageData = (await browser.storage.local.get(args.storageKey))?.[args.storageKey];
          const data = args.parse(storageData);
          const cbResult = cb(data);
          if (cbResult !== void 0) {
            await browser.storage.local.set({
              [args.storageKey]: args.serialize(cbResult)
            });
            await args.onChange?.({
              prev: args.parse(storageData),
              curr: cbResult
            });
          }
        } catch (err) {
        }
        res();
      });
    });
    return lastDataPromise;
  };
}
const getIconState = storageFactory({
  storageKey: "icon-state-3",
  parse(storageData) {
    const iconState = storageData ?? { state: "off" };
    return iconState;
  },
  serialize(iconState) {
    return iconState;
  },
  onChange({ prev, curr }) {
    const path = curr.state === "off" ? "/action-inactive.png" : "/action-active.png";
    const badgeText = curr.unreadCount ? `+${curr.unreadCount}` : "";
    const browserAction = browser.action ?? browser.browserAction;
    browserAction.setIcon({
      path
    });
    browserAction.setBadgeBackgroundColor({ color: "#9f99f5" });
    browserAction.setBadgeText({ text: badgeText });
  }
});
const getRelMeHrefDataStore = storageFactory({
  storageKey: "rel-me-href-data-store-3",
  parse(storageData) {
    let relMeHrefDataStore;
    try {
      relMeHrefDataStore = new Map(storageData);
    } catch (err) {
      relMeHrefDataStore = /* @__PURE__ */ new Map();
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
        unreadCount: (iconState.unreadCount ?? 0) + (currProfiles.size - prevProfiles.size)
      }));
    }
  }
});

export { SEND_REL_ME_HREF, getDisplayHref, getIconState, getProfiles, getRelMeHrefDataStore, getUncachedProfileData };
