import "webextension-polyfill";
import * as React from "react";
import * as ReactDom from "react-dom/client";
import * as ReactQuery from "@tanstack/react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createQuery } from "react-query-kit";
import { InView } from "react-intersection-observer";
import { Message, MessageReturn } from "./util/constants";
import { getDisplayHref } from "./util/getDisplayHref";
import { exportProfiles } from "./util/exportProfiles";
import { getProfiles } from "./util/getProfiles";
import { getIconState, getHrefStore } from "./util/storage";

getIconState(() => {
  return { state: "off" };
});

function getHrefProps(href: string): {
  target: string;
  onClick(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>): Promise<void>;
  href: string;
} {
  //   function redirectIfNeeded() {
  //     if (currentLocation.hash)
  //         return ;

  //     if (automatic) {
  //         window.location.replace(`https://tapbots.net/ivory_redirect?url=${encodeURIComponent(currentLocation)}`);
  //     } else {
  //         window.location.replace(`com.tapbots.Ivory:///openURL?url=${encodeURIComponent(currentLocation)}`);
  //     }
  // }

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

const useProfilesQuery = createQuery<ReturnType<typeof getProfiles>, never>({
  primaryKey: "profiles",
  async queryFn() {
    const profiles = getProfiles(await getHrefStore());
    return profiles;
  },
});

const navButtonClassName =
  "h-[1.68em] min-w-[1.4em] flex items-center justify-center rounded-6 bg-purple-light px-[0.38em] text-11 text-purple focus-visible:outline-none font-medium";

function Popup() {
  const profilesQuery = useProfilesQuery();
  const queryClient = ReactQuery.useQueryClient();

  return (
    <>
      <div className="flex flex-col items-center pt-[9px]">
        <img src="/icon-128.png" width="48" height="48" />

        <h1 className="text-14 font-medium leading-[1.21]">StreetPass</h1>
      </div>

      <div className="flex flex-col gap-18 px-12 pb-18 text-13 leading-[1.45]">
        {profilesQuery.data?.length === 0 && (
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

        {profilesQuery.data?.map((hrefData, index, arr) => {
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

              <InView
                as="div"
                className="flex flex-row items-start"
                triggerOnce
                onChange={async (inView) => {
                  if (!inView) {
                    return;
                  }

                  try {
                    const message: Message = {
                      name: "FETCH_PROFILE_UPDATE",
                      args: {
                        relMeHref: hrefData.relMeHref,
                      },
                    };
                    const resp = await MessageReturn.FETCH_PROFILE_UPDATE.parse(
                      browser.runtime.sendMessage(message),
                    );
                    if (!resp) {
                      return;
                    }

                    queryClient.refetchQueries();
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
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
                    {hrefData.profileData.account
                      ? `@${hrefData.profileData.account}`
                      : getDisplayHref(hrefData.profileData.profileUrl)}
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
              </InView>
            </React.Fragment>
          );
        })}
      </div>

      <div className="absolute right-12 top-12 flex gap-8">
        {!!profilesQuery.data?.length && (
          <span className={navButtonClassName}>
            {profilesQuery.data.length}
          </span>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={navButtonClassName}>
            <svg
              fill="currentColor"
              className="aspect-square w-[1em]"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="50" r="9" />
              <circle cx="50" cy="50" r="9" />
              <circle cx="85" cy="50" r="9" />
            </svg>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              side="bottom"
              sideOffset={6}
              avoidCollisions={false}
            >
              <DropdownMenu.Item
                onSelect={exportProfiles}
                className={navButtonClassName}
              >
                Export (.json)
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </>
  );
}

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error();
}

const root = ReactDom.createRoot(rootNode);

const queryClient = new ReactQuery.QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

root.render(
  <ReactQuery.QueryClientProvider client={queryClient}>
    <Popup />
  </ReactQuery.QueryClientProvider>,
);
