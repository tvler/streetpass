import { getDataUrlFromFile } from "./getDataUrlFromFile";
import { getProfiles } from "./getProfiles";
import { getHrefStore } from "./storage";

export async function exportProfiles(): Promise<void> {
  const profiles = getProfiles(await getHrefStore());

  const blob = new Blob([JSON.stringify(profiles)], {
    type: "application/json",
  });

  browser.tabs.create({
    url:
      /**
       * Chrome needs to use this method, because otherwise the blob isn't
       * recognized as a JSON file and won't allow downloading via command + s.
       * the opened tab will have a url blob:chrome-extension instead of data:application/json
       */
      __TARGET__ === "chrome"
        ? await getDataUrlFromFile(blob)
        : URL.createObjectURL(blob),
  });

  window.close();
}
