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
      ...hrefData,
      profileData: hrefData.profileData,
    });
  }

  return profiles.sort((a, b) => b.viewedAt - a.viewedAt);
}
