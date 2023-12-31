import { createQuery } from "react-query-kit";
import {
  getHideProfilesOnClick,
  getHrefStore,
  getProfileUrlScheme,
} from "./storage";
import { getProfiles } from "./getProfiles";

export const useHrefStoreQuery = createQuery({
  queryKey: ["profiles"],
  async fetcher() {
    const hrefStore = await getHrefStore();
    return {
      profiles: getProfiles(hrefStore),
      hiddenProfiles: getProfiles(hrefStore, { hidden: true }),
    };
  },
});

export const useProfileUrlSchemeQuery = createQuery({
  queryKey: ["profileurlscheme"],
  fetcher: () => getProfileUrlScheme(),
});

export const useHideProfilesOnClickQuery = createQuery({
  queryKey: ["hideprofilesonclick"],
  fetcher: () => getHideProfilesOnClick(),
});
