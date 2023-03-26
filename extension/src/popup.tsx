import "webextension-polyfill";
import * as React from "react";
import * as ReactDom from "react-dom/client";
import * as ReactQuery from "react-query";
import {
  getDisplayHref,
  getIconState,
  getProfiles,
  getRelMeHrefDataStore,
} from "./util";

getIconState(() => {
  return { state: "off" };
});

function Popup() {
  const relMeHrefDataStoreQuery = ReactQuery.useQuery(
    "relMeHrefDataStore",
    React.useCallback(() => getRelMeHrefDataStore(), [])
  );

  const values = React.useMemo(() => {
    if (!relMeHrefDataStoreQuery.data) {
      return [];
    }
    return Array.from(getProfiles(relMeHrefDataStoreQuery.data).values());
  }, [relMeHrefDataStoreQuery.data]);

  return (
    <>
      <div className="flex flex-col items-center pt-[9px]">
        <img src="/icon-128.png" width="48" height="48" />

        <h1 className="text-14 font-medium leading-[1.21]">StreetPass</h1>
      </div>

      <div className="flex flex-col gap-18 px-12 pb-18 text-13 leading-[1.45]">
        {!!values.length && (
          <span className="absolute top-12 right-12 rounded-6 bg-purple-light py-[0.18em] px-[0.45em] text-11 font-medium leading-[1.3] text-purple">
            {values.length}
          </span>
        )}

        {!values.length && !relMeHrefDataStoreQuery.isLoading && (
          <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center text-13 text-gray">
            <p>
              No profiles. Try{" "}
              <a
                href="https://streetpass.social/"
                target={"_blank"}
                className="font-medium text-purple"
              >
                this
              </a>
              !
            </p>
          </div>
        )}

        {values.map((relMeHrefData, index, arr) => {
          const prevRelMeHrefData = arr[index - 1];
          const prevRelMeHrefDate = prevRelMeHrefData
            ? new Date(prevRelMeHrefData.viewedAt).getDate()
            : new Date().getDate();
          const previousItemWasDayBefore =
            prevRelMeHrefDate !== new Date(relMeHrefData.viewedAt).getDate();

          return (
            <React.Fragment key={`${index}.${relMeHrefData.relMeHref}`}>
              {previousItemWasDayBefore && (
                <p className="shrink-0 text-gray">
                  {new Intl.DateTimeFormat(undefined, {
                    day: "numeric",
                    month: "short",
                  }).format(relMeHrefData.viewedAt)}
                </p>
              )}

              <div className="flex flex-row items-start">
                <p className="w-[65px] shrink-0 text-gray">
                  {new Intl.DateTimeFormat(undefined, {
                    timeStyle: "short",
                  })
                    .format(relMeHrefData.viewedAt)
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </p>

                <div className="flex flex-col items-start">
                  <a
                    href={relMeHrefData.profileData.profileUrl}
                    target="_blank"
                    className="break-word font-medium text-purple"
                  >
                    {getDisplayHref(relMeHrefData.profileData.profileUrl)}
                  </a>

                  <p className="text-gray">
                    <a
                      href={relMeHrefData.websiteUrl}
                      target="_blank"
                      className="break-word text-inherit"
                    >
                      {getDisplayHref(relMeHrefData.websiteUrl)}
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
  </ReactQuery.QueryClientProvider>
);
