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
import type { GetProfile } from "../../api/pages/api/get-profile";

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

const profilesMap = getProfiles(await getHrefStore());
const profiles = Array.from(profilesMap.values());

function Profile(props: { hrefData: (typeof profiles)[number] }) {
  const profileQuery = ReactQuery.useQuery({
    queryKey: ["get-profile", props.hrefData.relMeHref],
    async queryFn(context): Promise<GetProfile> {
      try {
        const getProfileUrl = new URL(
          "https://streetpass.social/api/get-profile"
        );
        getProfileUrl.searchParams.set("url", props.hrefData.relMeHref);
        const resp = await fetch(getProfileUrl);
        const profile: GetProfile = await resp.json();
        return profile;
      } catch (err) {
        return null;
      }
    },
  });

  console.log(profileQuery);

  return (
    <div className="flex flex-row items-start gap-x-12">
      {!!profileQuery.data?.avatarUrl && (
        <img
          width={20}
          height={20}
          src={profileQuery.data.avatarUrl}
          className="inline-block rounded-full"
        />
      )}

      <div className="flex min-w-0 flex-grow basis-0 flex-col items-start">
        <a
          {...getHrefProps(props.hrefData.profileData.profileUrl)}
          className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-gray"
        >
          <span className="font-medium text-purple">
            {profileQuery.data?.name}
          </span>
          &nbsp;
          <span>{profileQuery.data?.username}</span>
        </a>

        <p className="text-gray">
          <a
            {...getHrefProps(props.hrefData.websiteUrl)}
            className="break-word"
          >
            {getDisplayHref(props.hrefData.websiteUrl)}
          </a>
        </p>
      </div>

      <p className="shrink-0 text-gray">
        {new Intl.DateTimeFormat(undefined, {
          timeStyle: "short",
        })
          .format(props.hrefData.viewedAt)
          .toLowerCase()
          .replace(/\s+/g, "")}
      </p>
    </div>
  );
}

function Popup() {
  return (
    <>
      <div className="flex flex-col items-center pt-[20px]">
        <h1 className="text-14 font-medium leading-[1.21]">StreetPass</h1>
      </div>

      <div className="flex flex-col gap-18 px-12 pb-18 text-13 leading-[1.45]">
        {!!profiles.length && (
          <span className="absolute top-12 right-12 rounded-6 bg-purple-light py-[0.18em] px-[0.45em] text-11 font-medium leading-[1.3] text-purple">
            {profiles.length}
          </span>
        )}

        {!profiles.length && (
          <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center text-13 text-gray">
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

              <Profile hrefData={hrefData} />
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

const queryClient = new ReactQuery.QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      cacheTime: Infinity,
      refetchOnReconnect: false,
      staleTime: Infinity,
    },
  },
});

root.render(
  <ReactQuery.QueryClientProvider client={queryClient}>
    <Popup />
  </ReactQuery.QueryClientProvider>
);

type IntersectionObserverBoxProps<
  RefType extends Element,
  IDType,
  ComponentProps
> = {
  componentProps: ComponentProps;
  options?: IntersectionObserverInit;
  Component: React.ComponentType<
    ComponentProps & {
      ref: React.Ref<RefType>;
    }
  >;
  id: IDType;
  callback: (id: IDType) => IntersectionObserverCallback;
  skip?: boolean;
};

function IntersectionObserverBox<
  RefType extends HTMLElement,
  IDType,
  ComponentProps
>({
  options,
  Component,
  id,
  callback,
  skip = false,
  componentProps,
}: IntersectionObserverBoxProps<RefType, IDType, ComponentProps>): JSX.Element {
  const componentRef = React.useRef<RefType>(null);

  React.useEffect(() => {
    let observer: IntersectionObserver | undefined;

    if (!skip && componentRef.current) {
      observer = new window.IntersectionObserver(callback(id), options);
      observer.observe(componentRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [callback, id, options, skip]);

  return <Component {...componentProps} ref={componentRef} />;
}
