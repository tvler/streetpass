import "webextension-polyfill";
import * as React from "react";
import * as ReactDom from "react-dom/client";
import * as ReactQuery from "react-query";
import {
  getDisplayHref,
  getIconState,
  getProfiles,
  getHrefStore,
} from "./util";

getIconState(() => {
  return { state: "off" };
});

function getHrefProps(href: string): {
  target: string;
  onClick(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>): Promise<void>;
  href: string;
} {
  return {
    target: "_blank",
    href: href,
    async onClick(ev) {
      ev.preventDefault();
      const { metaKey } = ev;

      await browser.tabs.create({
        url: href,
        active: !metaKey,
      });

      if (!metaKey) {
        window.close();
      }
    },
  };
}

function Popup() {
  const hrefStoreQuery = ReactQuery.useQuery(
    "hrefStore",
    React.useCallback(() => getHrefStore(), []),
  );

  const profiles = React.useMemo(() => {
    if (!hrefStoreQuery.data) {
      return [];
    }
    return Array.from(getProfiles(hrefStoreQuery.data).values());
  }, [hrefStoreQuery.data]);

  return (
    <>
      <div className="flex flex-col items-center pt-[9px]">
        <img src="/icon-128.png" width="48" height="48" />

        <h1 className="text-14 font-medium leading-[1.21]">StreetPass</h1>
      </div>

      <div className="flex flex-col gap-18 px-12 pb-18 text-13 leading-[1.45]">
        {!!profiles.length && (
          <span className="absolute right-12 top-12 rounded-6 bg-purple-light px-[0.45em] py-[0.18em] text-11 font-medium leading-[1.3] text-purple">
            {profiles.length}
          </span>
        )}

        {!profiles.length && !hrefStoreQuery.isLoading && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center text-13 text-gray">
            <p>
              No profiles. Try{" "}
              <a
                {...getHrefProps("https://streetpass.social/")}
                className="font-medium text-purple"
              >
                this
              </a>
              !
            </p>
          </div>
        )}

        {profiles.map((hrefData, index, arr) => {
          const prevHrefData = arr[index - 1];
          const prevHrefDate = prevHrefData
            ? new Date(prevHrefData.viewedAt).getDate()
            : new Date().getDate();
          const previousItemWasDayBefore =
            prevHrefDate !== new Date(hrefData.viewedAt).getDate();

          return (
            <React.Fragment key={`${index}.${hrefData.relMeHref}`}>
              {previousItemWasDayBefore && (
                <p className="shrink-0 text-gray">
                  {new Intl.DateTimeFormat(undefined, {
                    day: "numeric",
                    month: "short",
                  }).format(hrefData.viewedAt)}
                </p>
              )}

              <div className="flex flex-row items-start">
                <p className="w-[65px] shrink-0 text-gray">
                  {new Intl.DateTimeFormat(undefined, {
                    timeStyle: "short",
                  })
                    .format(hrefData.viewedAt)
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </p>

                <div className="flex flex-col items-start">
                  <a
                    {...getHrefProps(hrefData.profileData.profileUrl)}
                    className="break-word font-medium text-purple"
                  >
                    {getDisplayHref(hrefData.profileData.profileUrl)}
                  </a>

                  <p className="text-gray">
                    <a
                      {...getHrefProps(hrefData.websiteUrl)}
                      className="break-word text-inherit"
                    >
                      {getDisplayHref(hrefData.websiteUrl)}
                    </a>
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error();
}

const root = ReactDom.createRoot(rootNode);

const queryClient = new ReactQuery.QueryClient();

root.render(
  <ReactQuery.QueryClientProvider client={queryClient}>
    <Popup />
  </ReactQuery.QueryClientProvider>,
);
