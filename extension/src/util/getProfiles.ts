import type { DeepReadonly } from "ts-essentials";
import { HrefData, HrefStore, Profile } from "./constants";

export function getProfiles(
  hrefStore: DeepReadonly<HrefStore>,
): Array<{ profileData: Profile } & HrefData> {
  const profiles: Array<{ profileData: Profile } & HrefData> = [];

  for (const hrefData of hrefStore.values()) {
    if (hrefData.profileData.type !== "profile") {
      continue;
    }
    profiles.push({
      profileData: hrefData.profileData,
      websiteUrl: hrefData.websiteUrl,
      viewedAt: hrefData.viewedAt,
      relMeHref: hrefData.relMeHref,
    });
  }

  return profiles.sort((a, b) => b.viewedAt - a.viewedAt);
}
