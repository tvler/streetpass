import "webextension-polyfill";
import * as React from "react";
import * as ReactDom from "react-dom/client";
import {
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as Popover from "@radix-ui/react-popover";
import * as Tabs from "@radix-ui/react-tabs";
import { createQuery } from "react-query-kit";
import { InView } from "react-intersection-observer";
import { Message, MessageReturn } from "./util/constants";
import { getDisplayHref } from "./util/getDisplayHref";
import { exportProfiles } from "./util/exportProfiles";
import { getProfiles } from "./util/getProfiles";
import {
  getIconState,
  getHrefStore,
  getProfileUrlScheme,
} from "./util/storage";
import { cva } from "class-variance-authority";
import {
  FormProvider,
  SubmitHandler,
  UseFormReturn,
  useForm,
  useFormContext,
} from "react-hook-form";
import { getProfileUrl } from "./util/getProfileUrl";
import { getIsUrlHttpOrHttps } from "./util/getIsUrlHttpOrHttps";

getIconState(() => {
  return { state: "off" };
});

enum Tab {
  root = "root",
  openProfilesWith = "openProfilesWith",
}

function getHrefProps(
  hrefOrFn: string | (() => Promise<string>),
): React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  return {
    async onClick(ev) {
      ev.preventDefault();
      const { metaKey: metaKeyUnresolved } = ev;

      const href = typeof hrefOrFn === "string" ? hrefOrFn : await hrefOrFn();
      const metaKey = getIsUrlHttpOrHttps(href) ? metaKeyUnresolved : false;

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

const useProfilesQuery = createQuery({
  primaryKey: "profiles",
  async queryFn() {
    const profiles = getProfiles(await getHrefStore());
    return profiles;
  },
});

const navButtonClassName = cva(
  [
    "h-[1.68em]",
    "min-w-[1.4em]",
    "flex",
    "items-center",
    "justify-center",
    "rounded-6",
    "px-[0.38em]",
    "text-11",
    "focus-visible:outline-none",
    "font-medium",
  ],
  {
    variants: {
      variant: {
        purple: ["bg-purple-light", "text-purple"],
        gray: ["bg-gray-light", "text-gray"],
      },
    },
    defaultVariants: { variant: "purple" },
  },
);

function Popup() {
  const profilesQuery = useProfilesQuery();
  const queryClient = useQueryClient();
  const popoverCloseRef = React.useRef<HTMLButtonElement>(null);

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
              <span
                {...getHrefProps("https://streetpass.social/")}
                className="cursor-pointer font-medium text-purple"
              >
                this
              </span>
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
                  <span
                    {...getHrefProps(() => getProfileUrl(hrefData.profileData))}
                    className="break-word cursor-pointer font-medium text-purple"
                  >
                    {hrefData.profileData.account
                      ? `@${hrefData.profileData.account}`
                      : getDisplayHref(hrefData.profileData.profileUrl)}
                  </span>

                  <span
                    {...getHrefProps(hrefData.websiteUrl)}
                    className="break-word cursor-pointer text-gray"
                  >
                    {getDisplayHref(hrefData.websiteUrl)}
                  </span>
                </div>
              </InView>
            </React.Fragment>
          );
        })}
      </div>

      <div className="absolute right-12 top-12 flex gap-8">
        {!!profilesQuery.data?.length && (
          <span className={navButtonClassName()}>
            {profilesQuery.data.length}
          </span>
        )}

        <Popover.Root modal>
          <Popover.Close hidden ref={popoverCloseRef} />

          <Popover.Trigger className={navButtonClassName()}>
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
          </Popover.Trigger>

          <Popover.Portal>
            <Tabs.Root defaultValue={Tab.root} className="contents">
              <Popover.Content
                align="end"
                side="bottom"
                sideOffset={6}
                avoidCollisions={false}
                className="flex rounded-6 border border-purple-light bg-white"
                onOpenAutoFocus={(ev) => {
                  ev.preventDefault();
                }}
                onCloseAutoFocus={(ev) => {
                  ev.preventDefault();
                }}
              >
                <Tabs.Content
                  value={Tab.root}
                  className="flex flex-col items-start gap-y-8 p-8"
                >
                  <Tabs.List className="contents">
                    <Tabs.Trigger
                      value={Tab.openProfilesWith}
                      className={navButtonClassName()}
                    >
                      Open Profiles With…
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Popover.Close
                    onClick={exportProfiles}
                    className={navButtonClassName()}
                  >
                    Export (.json)
                  </Popover.Close>
                </Tabs.Content>

                <Tabs.Content
                  value={Tab.openProfilesWith}
                  className="flex w-[275px] flex-col gap-y-8 pt-8"
                >
                  <Form
                    className="contents"
                    onSubmit={async (form) => {
                      await getProfileUrlScheme(() => form.url.trim());
                      popoverCloseRef.current?.click();
                    }}
                  >
                    <label className="contents">
                      <span className="px-8 text-12 text-gray">
                        Custom URL for profiles. Set as empty for default
                        behavior.
                      </span>

                      <FormConsumer>
                        {(form) => (
                          <input
                            spellCheck={false}
                            type="text"
                            className="mx-8 rounded-6 border border-purple-light bg-gray-lightest px-6 py-2 text-12 text-cool-black"
                            {...form.register("url")}
                          />
                        )}
                      </FormConsumer>
                    </label>

                    <span className="px-8 text-12 text-gray">
                      …or select a preset:
                    </span>

                    <div className="flex flex-wrap gap-8 px-8">
                      {(
                        [
                          "ivory",
                          "elk",
                          "icecubes",
                          "mastodon.social",
                          "mastodon.online",
                        ] as const
                      ).map((item) => {
                        return (
                          <React.Fragment key={item}>
                            <FormConsumer>
                              {(form) => (
                                <button
                                  type="button"
                                  className={navButtonClassName()}
                                  onClick={() => {
                                    form.setValue(
                                      "url",
                                      {
                                        ivory:
                                          "ivory://acct/user_profile/{account}",
                                        elk: "https://elk.zone/@{account}",
                                        icecubes:
                                          "icecubesapp:{profileUrl.noProtocol}",
                                        "mastodon.social":
                                          "https://mastodon.social/@{account}",
                                        "mastodon.online":
                                          "https://mastodon.online/@{account}",
                                      }[item],
                                    );
                                  }}
                                >
                                  {
                                    {
                                      ivory: "Ivory",
                                      elk: "Elk",
                                      icecubes: "Ice Cubes",
                                      "mastodon.social": "mastodon.social",
                                      "mastodon.online": "mastodon.online",
                                    }[item]
                                  }
                                </button>
                              )}
                            </FormConsumer>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-x-8 border-t border-purple-light px-8 py-8">
                      <FormConsumer>
                        {(form) => (
                          <button
                            type="button"
                            onClick={() => {
                              form.setValue("url", "");
                            }}
                            className={navButtonClassName({ variant: "gray" })}
                          >
                            Clear
                          </button>
                        )}
                      </FormConsumer>

                      <button className={navButtonClassName()}>Save</button>
                    </div>
                  </Form>
                </Tabs.Content>
              </Popover.Content>
            </Tabs.Root>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </>
  );
}

type FormData = { url: string };

function Form(
  props: React.PropsWithChildren<{
    onSubmit: SubmitHandler<FormData>;
    className?: string;
  }>,
) {
  const form = useForm<FormData>({
    shouldUseNativeValidation: true,
    defaultValues: React.useCallback(async () => {
      return { url: await getProfileUrlScheme() };
    }, []),
  });

  return (
    <FormProvider {...form}>
      <form
        className={props.className}
        onSubmit={form.handleSubmit(props.onSubmit)}
      >
        {props.children}
      </form>
    </FormProvider>
  );
}

function FormConsumer(props: {
  children: (form: UseFormReturn<FormData, any, undefined>) => JSX.Element;
}) {
  const form = useFormContext<FormData>();
  return props.children(form);
}

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error();
}

const root = ReactDom.createRoot(rootNode);

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <Popup />
  </QueryClientProvider>,
);
