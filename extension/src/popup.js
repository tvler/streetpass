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

  if (values.length) {
    const userCount = document.createElement("span");
    userCount.style.position = "absolute";
    userCount.style.top = "12px";
    userCount.style.right = "12px";
    userCount.style.paddingBlock = "3px";
    userCount.style.paddingInline = "6px";
    userCount.style.backgroundColor = "#EFEDFC";
    userCount.style.borderRadius = "6px";
    userCount.style.color = "#5F55EC";
    userCount.style.fontWeight = "500";
    userCount.style.fontSize = "12px";
    userCount.style.lineHeight = "1.3";
    userCount.appendChild(document.createTextNode(`${values.length}`));
    document.querySelector("#root")?.appendChild(userCount);
  } else {
    const nullStateTextLink = document.createElement("a");
    nullStateTextLink.href = "https://streetpass.social/";
    nullStateTextLink.target = "_blank";
    nullStateTextLink.style.color = "#5F55EC";
    nullStateTextLink.style.fontWeight = "500";
    nullStateTextLink.appendChild(document.createTextNode(`this`));
    const nullStateText = document.createElement("p");
    nullStateText.appendChild(document.createTextNode(`No profiles. Try `));
    nullStateText.appendChild(nullStateTextLink);
    nullStateText.appendChild(document.createTextNode(`!`));
    const nullState = document.createElement("div");
    nullState.style.position = "absolute";
    nullState.style.top = "0";
    nullState.style.right = "0";
    nullState.style.bottom = "0";
    nullState.style.left = "0";
    nullState.style.display = "flex";
    nullState.style.justifyContent = "center";
    nullState.style.alignItems = "center";
    nullState.style.color = "#7b7b7b";
    nullState.style.fontSize = "13";
    nullState.appendChild(nullStateText);
    document.querySelector("#root")?.appendChild(nullState);
  }

  for (let i = 0; i < values.length; i++) {
    const relMeHrefData = values[i];
    if (!relMeHrefData) {
      continue;
    }
    const prevRelMeHrefData = values[i - 1];
    const prevRelMeHrefDate = !!prevRelMeHrefData
      ? new Date(prevRelMeHrefData.viewedAt).getDate()
      : new Date().getDate();
    const previousItemWasDayBefore =
      prevRelMeHrefDate !== new Date(relMeHrefData.viewedAt).getDate();

    const profileRow = document.createElement("a");
    profileRow.href = relMeHrefData.profileData.profileUrl;
    profileRow.target = "_blank";
    profileRow.style.wordBreak = "break-word";
    profileRow.style.color = "#5F55EC";
    profileRow.style.fontWeight = "500";
    profileRow.appendChild(
      document.createTextNode(
        getDisplayHref(relMeHrefData.profileData.profileUrl)
      )
    );

    const websiteRowAnchor = document.createElement("a");
    websiteRowAnchor.href = relMeHrefData.websiteUrl;
    websiteRowAnchor.target = "_blank";
    websiteRowAnchor.style.color = "inherit";
    websiteRowAnchor.style.wordBreak = "break-word";
    websiteRowAnchor.appendChild(
      document.createTextNode(getDisplayHref(relMeHrefData.websiteUrl))
    );
    const websiteRow = document.createElement("p");
    websiteRow.style.color = "#7b7b7b";
    websiteRow.appendChild(websiteRowAnchor);

    const urlColumn = document.createElement("div");
    urlColumn.style.display = "flex";
    urlColumn.style.flexDirection = "column";
    urlColumn.style.alignItems = "flex-start";
    // urlColumn.style.gap = "2px";
    urlColumn.appendChild(profileRow);
    urlColumn.appendChild(websiteRow);

    const dateColumn = document.createElement("p");
    dateColumn.style.width = "65px";
    dateColumn.style.color = "#7b7b7b";
    dateColumn.style.flexShrink = "0";
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
    profileListItem.style.display = "flex";
    profileListItem.style.flexDirection = "row";
    profileListItem.style.alignItems = "start";
    profileListItem.appendChild(dateColumn);
    profileListItem.appendChild(urlColumn);

    const profileList = document.querySelector("#profile-list");
    if (previousItemWasDayBefore) {
      const dayRow = document.createElement("p");
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
