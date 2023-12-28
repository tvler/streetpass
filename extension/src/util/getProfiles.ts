import type { DeepReadonly } from "ts-essentials";
import { HrefDataType, HrefStore } from "./constants";

export function getProfiles(
  hrefStore: DeepReadonly<HrefStore>,
  options?: { hidden?: boolean },
): Array<HrefDataType<"profile">> {
  const profiles: Array<HrefDataType<"profile">> = [];

  for (const hrefData of hrefStore.values()) {
    if (hrefData.profileData.type !== "profile") {
      continue;
    }

    if (!!hrefData.hidden !== !!options?.hidden) {
      continue;
    }

    profiles.push({
      ...hrefData,
      profileData: hrefData.profileData,
    });
  }

  return profiles.sort((a, b) => b.viewedAt - a.viewedAt);
}
