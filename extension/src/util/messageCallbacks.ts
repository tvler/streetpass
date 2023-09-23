import { z } from "zod";
import {
  Message,
  MessageReturn,
  Profile,
  timeToExpireNotProfile,
  timeToUpdateProfile,
} from "./constants";
import { getUncachedProfileData } from "./getUncachedProfileData";
import { getHrefStore } from "./storage";

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

    console.log({ profileData });

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
  async FETCH_PROFILE_UPDATE(args): Promise<boolean> {
    /**
     * Exit if relMeHref isn't a valid url
     */
    try {
      new URL(args.relMeHref);
    } catch (err) {
      return false;
    }

    const hasUpdated = false;
    await getHrefStore(async (hrefStore) => {
      const existingHrefData = hrefStore.get(args.relMeHref);
      if (!existingHrefData) {
        return;
      }

      /**
       * Exit if has been updated recently
       */
      if (
        (existingHrefData.updatedAt ?? existingHrefData.viewedAt) +
          timeToUpdateProfile >
        Date.now()
      ) {
        console.log("has been updated recently", args.relMeHref);
        return;
      }

      let profileData: Profile | undefined;
      try {
        /**
         * Exit if existingHrefData isn't a profile
         */
        if (existingHrefData.profileData.type === "notProfile") {
          throw new Error();
        }

        /**
         * Exit if fetched profileData is notProfile
         */
        const _profileData = await getUncachedProfileData(args.relMeHref);
        if (_profileData.type === "notProfile") {
          throw new Error();
        }

        /**
         * Exit if all keys are equal
         */
        {
          let allKeysAreEqual = true;
          for (const key of Profile.keyof().options) {
            if (existingHrefData.profileData[key] !== _profileData[key]) {
              console.log(
                "different",
                key,
                existingHrefData.profileData,
                _profileData,
              );
              allKeysAreEqual = false;
              break;
            }
          }
          if (allKeysAreEqual) {
            console.log("allKeysAreEqual");
            throw new Error();
          }
        }

        console.log("updating");
        profileData = _profileData;
      } catch (err) {
        // Do nothing
      }

      return new Map(hrefStore).set(args.relMeHref, {
        ...existingHrefData,
        updatedAt: Date.now(),
        profileData: profileData ?? existingHrefData.profileData,
      });
    });

    /**
     * Return true
     */
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
