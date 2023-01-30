import "webextension-polyfill";
import {
  getDisplayHref,
  getIconState,
  getProfiles,
  getRelMeHrefDataStore,
} from "./util.js";
import type { RelMeHrefDataStore } from "./util.js";

document.querySelector("#root")?.addEventListener("click", (ev) => {
  if (!ev.target) {
    return;
  }
  const target = ev.target as Element;

  const origin = target?.closest("a");

  if (origin && !!origin.href) {
    // Need to pause before closing popup in firefox or else links will open in new window
    window.setTimeout(() => {
      window.close();
    }, 80);
  }
});

getIconState(() => {
  return { state: "off" };
});

let relMeHrefDataStore: RelMeHrefDataStore | undefined;
await getRelMeHrefDataStore((innerRelMeHrefDataStore) => {
  relMeHrefDataStore = innerRelMeHrefDataStore;
});

if (relMeHrefDataStore) {
  const values = Array.from(getProfiles(relMeHrefDataStore).values());

  if (values.length) {
    const userCount = document.createElement("span");
    userCount.className =
      "absolute top-12 right-12 leading-[1.3] rounded-6 \
      text-11 text-purple py-[0.18em] px-[0.45em] bg-purple-light font-medium";
    userCount.appendChild(document.createTextNode(`${values.length}`));
    document.querySelector("#root")?.appendChild(userCount);
  } else {
    const nullStateTextLink = document.createElement("a");
    nullStateTextLink.href = "https://streetpass.social/";
    nullStateTextLink.target = "_blank";
    nullStateTextLink.className = "text-purple font-medium";
    nullStateTextLink.appendChild(document.createTextNode(`this`));
    const nullStateText = document.createElement("p");
    nullStateText.appendChild(document.createTextNode(`No profiles. Try `));
    nullStateText.appendChild(nullStateTextLink);
    nullStateText.appendChild(document.createTextNode(`!`));
    const nullState = document.createElement("div");
    nullState.className =
      "absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center\
      text-gray text-13";
    nullState.appendChild(nullStateText);
    document.querySelector("#root")?.appendChild(nullState);
  }

  for (let i = 0; i < values.length; i++) {
    const relMeHrefData = values[i];
    if (!relMeHrefData) {
      continue;
    }
    const prevRelMeHrefData = values[i - 1];
    const prevRelMeHrefDate = prevRelMeHrefData
      ? new Date(prevRelMeHrefData.viewedAt).getDate()
      : new Date().getDate();
    const previousItemWasDayBefore =
      prevRelMeHrefDate !== new Date(relMeHrefData.viewedAt).getDate();

    const profileRow = document.createElement("a");
    profileRow.href = relMeHrefData.profileData.profileUrl;
    profileRow.target = "_blank";
    profileRow.className = "break-word text-purple font-medium";
    profileRow.appendChild(
      document.createTextNode(
        getDisplayHref(relMeHrefData.profileData.profileUrl)
      )
    );

    const websiteRowAnchor = document.createElement("a");
    websiteRowAnchor.href = relMeHrefData.websiteUrl;
    websiteRowAnchor.target = "_blank";
    websiteRowAnchor.className = "break-word text-inherit";
    websiteRowAnchor.appendChild(
      document.createTextNode(getDisplayHref(relMeHrefData.websiteUrl))
    );
    const websiteRow = document.createElement("p");
    websiteRow.className = "text-gray";
    websiteRow.appendChild(websiteRowAnchor);

    const urlColumn = document.createElement("div");
    urlColumn.className = "items-start flex flex-col";
    urlColumn.appendChild(profileRow);
    urlColumn.appendChild(websiteRow);

    const dateColumn = document.createElement("p");
    dateColumn.className = "w-[65px] text-gray shrink-0";
    dateColumn.appendChild(
      document.createTextNode(
        new Intl.DateTimeFormat(undefined, {
          timeStyle: "short",
        })
          .format(relMeHrefData.viewedAt)
          .toLowerCase()
          .replace(/\s+/g, "")
      )
    );

    const profileListItem = document.createElement("div");
    profileListItem.className = "flex flex-row items-start";
    profileListItem.appendChild(dateColumn);
    profileListItem.appendChild(urlColumn);

    const profileList = document.querySelector("#profile-list");
    if (previousItemWasDayBefore) {
      const dayRow = document.createElement("p");
      dayRow.className = "shrink-0 text-gray";
      dayRow.appendChild(
        document.createTextNode(
          new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short",
          }).format(relMeHrefData.viewedAt)
        )
      );
      profileList?.appendChild(dayRow);
    }
    profileList?.appendChild(profileListItem);
  }
}
