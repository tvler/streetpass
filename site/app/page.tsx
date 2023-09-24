/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import icon from "../public/icon-256.png";
import chrome from "../public/chrome.png";
import firefox from "../public/firefox.png";
import safari from "../public/safari.png";
import screen1 from "../public/screen1.png";
import screen3 from "../public/screen3.png";
import { VERSION } from "../../constants";
import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: "StreetPass for Mastodon",
  description: "StreetPass: Find your people on Mastodon",
  icons: {
    other: {
      rel: "me",
      url: "https://mastodon.social/@tvler",
    },
  },
};

const Page: NextPage = () => {
  return (
    <div className="flex flex-col items-center px-3 pt-6">
      <div className="flex flex-col items-center">
        <Image
          quality={100}
          loading="eager"
          src={icon}
          alt=""
          width={76}
          height={76}
        />

        <h1 className="-mt-1.5 text-3xl font-semibold">StreetPass</h1>

        <p className="text-md text-center font-semibold leading-5 text-purple">
          Find your people
          <br />
          on Mastodon
        </p>

        <a
          href="https://github.com/tvler/streetpass"
          className="mt-8 inline-flex rounded-r-[0.5em] bg-purple-light text-[0.7rem] leading-[1.9]"
        >
          <span className="inline-flex items-center gap-[0.25em] rounded-[0.5em] bg-purple px-[0.45em] font-semibold text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              className="-mt-[0.05em]"
            >
              <path
                fill="currentColor"
                className="text-white"
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            GitHub
          </span>
          <span className="inline-flex px-[0.45em] font-semibold text-purple">
            v{VERSION}
          </span>
        </a>
      </div>

      <div className="mt-4 grid auto-cols-fr grid-flow-col gap-6">
        {(["chrome", "firefox", "safari"] as const).map((browser) => {
          const link = {
            chrome:
              "https://chrome.google.com/webstore/detail/streetpass-for-mastodon/fphjfedjhinpnjblomfebcjjpdpakhhn",
            firefox:
              "https://addons.mozilla.org/en-US/firefox/addon/streetpass-for-mastodon/",
            safari:
              "https://apps.apple.com/us/app/streetpass-for-mastodon/id6446224821",
          }[browser];

          const imageSrc = {
            chrome: chrome,
            firefox: firefox,
            safari: safari,
          }[browser];

          const title = {
            chrome: "Chrome",
            firefox: "Firefox",
            safari: "Safari",
          }[browser];

          return (
            <a
              key={title}
              href={link}
              className={
                "flex flex-col items-center text-center text-sm font-medium text-purple underline"
              }
            >
              <Image
                src={imageSrc}
                quality={100}
                loading="eager"
                alt=""
                height={62}
              />
              <span className="relative mt-1 inline-block">{title}</span>
            </a>
          );
        })}
      </div>

      <div className="mt-8 flex w-full max-w-lg flex-col items-start font-medium leading-[1.5]">
        <p className="">
          StreetPass is a browser extension that helps you find your people on
          Mastodon. Here's how it works:
        </p>

        <p className="mt-5">
          <span className="text-purple">1.</span> Mastodon users verify
          themselves by adding a{" "}
          <a
            href="https://docs.joinmastodon.org/user/profile/#verification"
            className="text-purple underline"
          >
            custom link
          </a>{" "}
          to their personal site.
        </p>

        <p className="mt-5">
          <span className="text-purple">2.</span> StreetPass lets you know when
          you've found one of these links, and adds them to your StreetPass
          list.
        </p>

        <p className="mt-5">
          <span className="text-purple">3.</span> Browse the web as usual.
          StreetPass will build a list of Mastodon users made up of the websites
          you go to.
        </p>

        <p className="mt-5">
          ❤️ StreetPass is made possible by open web{" "}
          <a
            href="http://microformats.org/wiki/rel-me"
            className="text-purple underline"
          >
            identity verification standards
          </a>{" "}
          and is 100% open source!
        </p>
      </div>

      <Image
        quality={100}
        src={screen3}
        alt=""
        width={1296}
        className="mt-8 w-full max-w-xl"
      />

      <div className="flex w-full max-w-lg flex-col items-start text-[0.9rem] font-medium leading-[1.57]">
        <h2 className="mt-12 font-bold">Privacy commitments:</h2>

        <p className="mt-5">
          <span className="font-bold">Nothing leaves your device.</span>{" "}
          StreetPass will never collect analytics, and all profile resolution is
          handled directly in your browser. This means that StreetPass doesn't
          require any sort of server being up-and-running for you to use it.
          Once installed, it's yours forever.
        </p>

        <p className="mt-5">
          <span className="font-bold">User-inspectable.</span> The code for
          StreetPass is designed to be readable and auditable. To achieve this,
          StreetPass uses a modern JavaScript module architecture and doesn't
          minify any of its source code. You can build the extension from source
          by reading the instructions in the{" "}
          <a
            className="text-purple underline"
            href="https://github.com/tvler/streetpass"
          >
            GitHub repo
          </a>
          .
        </p>
      </div>

      <div className="w-full max-w-lg font-medium">
        <p className="mb-10 mt-16 text-center">
          Made by{" "}
          <a className="text-purple underline" href="https://tylerdeitz.com/">
            Tyler
          </a>
        </p>
      </div>
    </div>
  );
};

export default Page;
