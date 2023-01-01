/**
 * @typedef {{ profileUrl: string, websiteUrl: string, viewedAt: number }} Profile
 * @typedef {Map<string, Profile>} Profiles
 * @typedef {'requestRelMeElementsMessage'} RequestRelMeElementsMessage
 */

/**
 * @type {RequestRelMeElementsMessage}
 */
const requestRelMeElementsMessage = "requestRelMeElementsMessage";

/**
 * @param {string | undefined} uncheckedUrl
 * @returns {boolean}
 */
function getIsUrlHttpOrHttps(uncheckedUrl) {
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
let lastProfilesPromise = Promise.resolve();
/**
 * @param {(profiles: Profiles) => (void | Profiles | Promise<void | Profiles>)} cb
 */
async function getProfiles(cb) {
  const PROFILES_STORAGE_KEY = "profiles15";

  const oldLastProfilesPromise = lastProfilesPromise;
  lastProfilesPromise = new Promise((res) => {
    oldLastProfilesPromise.then(async () => {
      try {
        /**
         * @type {Profiles}
         */
        let profiles;
        try {
          const profilesArray =
            (await chrome.storage.local.get(PROFILES_STORAGE_KEY))?.[
              PROFILES_STORAGE_KEY
            ] ?? [];

          profiles = new Map(profilesArray);
        } catch (err) {
          profiles = new Map();
        }

        const callbackResult = await cb(profiles);

        if (callbackResult) {
          await chrome.storage.local.set({
            [PROFILES_STORAGE_KEY]: Array.from(callbackResult.entries()),
          });
        }
      } catch (err) {
        // Nothing
      }

      res();
    });
  });
  return lastProfilesPromise;
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !getIsUrlHttpOrHttps(tab.url)) {
    return;
  }

  /**
   * @type {import('./content-script.js').SendRelMeHrefsRet}
   */
  const relMeHrefs = await chrome.tabs.sendMessage(
    tabId,
    requestRelMeElementsMessage
  );

  console.log("relMeHrefs", relMeHrefs);

  await Promise.allSettled(
    relMeHrefs.map(async (relMeHref) => {
      if (!getIsUrlHttpOrHttps(relMeHref)) {
        return;
      }

      /**
       * @type {Profile | undefined}
       */
      let profile;
      await getProfiles((profiles) => {
        profile = profiles.get(relMeHref);
      });
      if (!profile) {
        const visitedRelMeHrefResp = await fetch(relMeHref);
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

        if (!tab.url) {
          return;
        }

        profile = {
          profileUrl: visitedRelMeUrl.toString(),
          websiteUrl: tab.url,
          viewedAt: Date.now(),
        };
      }

      await getProfiles((profiles) => {
        if (!profile) {
          return;
        }

        profiles.delete(relMeHref);
        profiles.set(relMeHref, profile);

        return profiles;
      });
    })
  );

  await getProfiles((profiles) => {
    console.log("profiles");
    console.log(Array.from(profiles.keys()));
    console.log("");
  });
});

// chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//   /**
//    * @param {number} ms
//    */
//   function sleep(ms) {
//     /** @type Promise<void> */
//     const p = new Promise((resolve) => {
//       setTimeout(() => {
//         resolve();
//       }, ms);
//     });

//     return p;
//   }

//   if (changeInfo.status !== "complete" || !getIsUrlHttpOrHttps(tab.url)) {
//     return;
//   }

//   console.log("start");
//   getProfiles(async () => {
//     console.log("getting 1");
//     await sleep(1000);
//     console.log("done w 1");
//   });
//   getProfiles(async () => {
//     console.log("getting 2");
//     await sleep(1000);
//   });
//   await getProfiles(async () => {
//     console.log("getting 3");
//     await sleep(1000);
//   });
//   getProfiles(async () => {
//     console.log("getting 4");
//     await sleep(500);
//   });
//   await getProfiles(async () => {
//     console.log("getting 5");
//     await sleep(1000);
//   });
//   console.log("done");
// });
