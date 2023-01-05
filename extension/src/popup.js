import {
  getDisplayHref,
  getIconState,
  getProfiles,
  getRelMeHrefDataStore,
} from "./util.js";

getIconState(() => "off");

/**
 * @type {import("./util.js").RelMeHrefDataStore | undefined}
 */
let relMeHrefDataStore;
await getRelMeHrefDataStore((innerRelMeHrefDataStore) => {
  relMeHrefDataStore = innerRelMeHrefDataStore;
});

if (relMeHrefDataStore) {
  const values = Array.from(getProfiles(relMeHrefDataStore).values());

  for (let i = 0; i < values.length; i++) {
    const relMeHrefData = values[i];
    if (!relMeHrefData) {
      continue;
    }
    const prevRelMeHrefData = values[i - 1];
    const previousItemWasDayBefore =
      !!prevRelMeHrefData &&
      new Date(prevRelMeHrefData.viewedAt).getDate() !==
        new Date(relMeHrefData.viewedAt).getDate();

    const profileRow = document.createElement("a");
    profileRow.href = relMeHrefData.profileData.profileUrl;
    profileRow.target = "_blank";
    profileRow.style.wordBreak = "break-all";
    profileRow.style.fontSize = "13px";
    profileRow.appendChild(
      document.createTextNode(
        getDisplayHref(relMeHrefData.profileData.profileUrl)
      )
    );

    const websiteRowAnchor = document.createElement("a");
    websiteRowAnchor.href = relMeHrefData.websiteUrl;
    websiteRowAnchor.target = "_blank";
    websiteRowAnchor.style.color = "inherit";
    websiteRowAnchor.style.wordBreak = "break-all";
    websiteRowAnchor.appendChild(
      document.createTextNode(getDisplayHref(relMeHrefData.websiteUrl))
    );
    const websiteRow = document.createElement("p");
    websiteRow.style.fontSize = "13px";
    websiteRow.style.color = "#7b7b7b";
    websiteRow.appendChild(websiteRowAnchor);

    const urlColumn = document.createElement("div");
    urlColumn.style.display = "flex";
    urlColumn.style.flexDirection = "column";
    urlColumn.style.alignItems = "flex-start";
    urlColumn.style.gap = "2px";
    urlColumn.appendChild(profileRow);
    urlColumn.appendChild(websiteRow);

    const dateColumn = document.createElement("p");
    dateColumn.style.fontSize = "13px";
    dateColumn.style.width = "74px";
    dateColumn.style.color = "#7b7b7b";
    dateColumn.style.flexShrink = "0";
    dateColumn.appendChild(
      document.createTextNode(
        new Intl.DateTimeFormat(undefined, {
          timeStyle: "short",
        }).format(relMeHrefData.viewedAt)
      )
    );

    const profileListItem = document.createElement("div");
    profileListItem.style.display = "flex";
    profileListItem.style.flexDirection = "row";
    profileListItem.style.alignItems = "start";
    profileListItem.style.lineHeight = "1.3";
    profileListItem.appendChild(dateColumn);
    profileListItem.appendChild(urlColumn);

    const profileList = document.querySelector("#profile-list");
    if (previousItemWasDayBefore) {
      const dayRow = document.createElement("p");
      dayRow.style.fontSize = "13px";
      dayRow.style.color = "#7b7b7b";
      dayRow.style.flexShrink = "0";
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
