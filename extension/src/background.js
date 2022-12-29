const PROFILES_STORAGE_KEY = "profiles2";

chrome.runtime.onMessage.addListener(
  /**
   * @param {unknown} message
   */
  async function onMessage(message, sender) {
    if (typeof message !== "string" || !sender.url) {
      return;
    }

    /**
     * @type {string | undefined}
     */
    let profileUrl;
    try {
      const messageUrl = new URL(message);
      const webfingerUrl = new URL(messageUrl.origin);
      webfingerUrl.pathname = ".well-known/webfinger";
      webfingerUrl.searchParams.set("resource", messageUrl.toString());
      console.log(webfingerUrl.toString());
      const webfingerResp = await fetch(webfingerUrl.toString());
      /**
       * @type {unknown}
       */
      const webfingerJson = await webfingerResp.json();
      if (
        !webfingerJson ||
        typeof webfingerJson !== "object" ||
        !("links" in webfingerJson) ||
        !Array.isArray(webfingerJson.links)
      ) {
        return;
      }

      for (const linkAny of webfingerJson.links) {
        /**
         * @type {unknown}
         */
        const link = linkAny;
        if (
          link &&
          typeof link === "object" &&
          "rel" in link &&
          link.rel === "http://webfinger.net/rel/profile-page" &&
          "href" in link &&
          typeof link.href === "string"
        ) {
          profileUrl = link.href;
          break;
        }
      }
    } catch (err) {
      // nothing
    }
    if (!profileUrl) {
      return;
    }

    /**
     * @type {{ profileUrl: string, websiteUrl: string, viewedAt: number }}
     */
    const profile = {
      profileUrl: profileUrl,
      websiteUrl: sender.url,
      viewedAt: Date.now(),
    };

    /**
     * @type {Map<string, typeof profile>}
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

    profiles.set(profile.profileUrl, profile);

    console.log("here", profileUrl, sender);
    console.log(profiles);
    console.log(Array.from(profiles.entries()));
    console.log();

    await chrome.storage.local.set({
      [PROFILES_STORAGE_KEY]: Array.from(profiles.entries()),
    });
  }
);
