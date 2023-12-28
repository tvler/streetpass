import { z } from "zod";
import {
  Message,
  MessageReturn,
  Profile,
  timeToExpireNotProfile,
  timeToUpdateProfile,
} from "./constants";
import { getUncachedProfileData } from "./getUncachedProfileData";
import { getHideProfilesOnClick, getHrefStore } from "./storage";

type ArgMap = {
  [Key in Message["name"]]: Extract<Message, { name: Key }>["args"];
};

export const messageCallbacks: {
  [K in keyof ArgMap]: (value: ArgMap[K]) => z.infer<(typeof MessageReturn)[K]>;
} = {
  async HREF_PAYLOAD(args) {
    const hasExistingHrefData = (
      await getHrefStore((prev) => {
        const hrefStore = new Map(prev);
        for (const [key, hrefData] of hrefStore) {
          if (
            hrefData.profileData.type === "notProfile" &&
            hrefData.viewedAt + timeToExpireNotProfile < Date.now()
          ) {
            hrefStore.delete(key);
          }
        }

        return hrefStore;
      })
    ).has(args.relMeHref);

    if (hasExistingHrefData) {
      return;
    }

    const profileData = await getUncachedProfileData(args.relMeHref);

    await getHrefStore((hrefStore) => {
      const newHrefStore = new Map(hrefStore);
      newHrefStore.set(args.relMeHref, {
        profileData: profileData,
        viewedAt: Date.now(),
        websiteUrl: args.tabUrl,
        relMeHref: args.relMeHref,
      });

      return newHrefStore;
    });
  },
  /**
   * Update a profile with uncached data. Returns true if updated.
   * Will not add a new profile, only update an existing one.
   */
  async FETCH_PROFILE_UPDATE(args) {
    // console.log("FETCH_PROFILE_UPDATE", args.relMeHref);

    /**
     * Exit if relMeHref isn't a valid url
     */
    try {
      new URL(args.relMeHref);
    } catch (err) {
      return false;
    }

    /**
     * Exit if not already in hrefStore
     */
    const existingHrefData = (await getHrefStore()).get(args.relMeHref);
    if (!existingHrefData) {
      // console.log("not profile type");
      return false;
    }

    /**
     * Exit if has been updated recently
     */
    {
      const lastDate = existingHrefData.updatedAt ?? existingHrefData.viewedAt;
      if (lastDate + timeToUpdateProfile > Date.now()) {
        // console.log("has been updated recently", args.relMeHref);
        return false;
      }
    }

    const uncachedProfileData = await getUncachedProfileData(args.relMeHref);

    const shouldUpdateProfile =
      uncachedProfileData.type === "profile" &&
      Profile.keyof().options.some(
        (key) =>
          existingHrefData.profileData.type === "profile" &&
          existingHrefData.profileData[key] !== uncachedProfileData[key],
      );

    await getHrefStore((hrefStore) => {
      return new Map(hrefStore).set(args.relMeHref, {
        ...existingHrefData,
        updatedAt: Date.now(),
        profileData: shouldUpdateProfile
          ? uncachedProfileData
          : existingHrefData.profileData,
      });
    });

    // console.log({
    //   shouldUpdateProfile,
    //   existingHrefData,
    //   uncachedProfileData,
    // });
    return shouldUpdateProfile;
  },
  async HIDE_PROFILE_ON_CLICK(args) {
    const hideProfilesOnClick = await getHideProfilesOnClick();
    if (!hideProfilesOnClick) {
      return false;
    }

    await getHrefStore((prev) => {
      const hrefStore = new Map(prev);
      const hrefData = hrefStore.get(args.relMeHref);
      if (!hrefData) {
        return;
      }

      hrefStore.set(args.relMeHref, {
        ...hrefData,
        hidden: true,
      });
    });

    return true;
  },
};

/**
 * Thanks to https://stackoverflow.com/questions/70598583/argument-of-type-string-number-is-not-assignable-to-parameter-of-type-never
 * And https://github.com/Microsoft/TypeScript/issues/30581#issuecomment-1008338350
 * todo look at https://github.com/Microsoft/TypeScript/issues/30581#issuecomment-1080979994
 */
export function runMessageCallback<K extends keyof ArgMap>(
  message: { [P in K]: { name: P; args: ArgMap[P] } }[K],
): z.infer<(typeof MessageReturn)[K]> {
  return messageCallbacks[message.name](message.args);
}
