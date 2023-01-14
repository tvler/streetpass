/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import icon from "../public/icon256.png";
import webstore from "../public/webstore.png";
import screen1 from "../public/screen1.png";
import screen3 from "../public/screen3.png";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <link rel="me" href="https://mastodon.social/@tvler" />
        <meta
          name="description"
          content="StreetPass: Find your people on Mastodon"
        />
        <title>StreetPass for Mastodon</title>
      </Head>

      <div className="flex flex-col items-center px-3 pt-8">
        <div className="flex flex-col items-center">
          <Image
            quality={100}
            loading="eager"
            src={icon}
            alt=""
            width={85}
            height={85}
          />

          <h1 className="text-3xl font-semibold">StreetPass</h1>

          <p className="text-md text-center font-semibold leading-5 text-purple">
            Find your people
            <br />
            on Mastodon
          </p>
        </div>

        <a
          href="https://chrome.google.com/webstore/detail/streetpass-for-mastodon/fphjfedjhinpnjblomfebcjjpdpakhhn"
          className="mt-8 flex flex-col items-center text-center text-sm font-medium text-purple underline"
        >
          <Image
            src={webstore}
            quality={100}
            loading="eager"
            alt=""
            width={220}
          />
          <span className="mt-1">Download for Chrome</span>
        </a>

        <a
          href="https://github.com/tvler/streetpass"
          className="mt-1 text-center text-sm font-medium text-purple underline"
        >
          View on GitHub
        </a>

        <div className="w-full max-w-lg font-medium">
          <p className="mt-8">
            StreetPass is a simple browser extension that helps you find your
            people on Mastodon. Here's how it works:
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
            <span className="text-purple">2.</span> StreetPass lets you know
            when you've found one of these links, and adds them to your
            StreetPass list.
          </p>

          <p className="mt-5">
            <span className="text-purple">3.</span> Browse the web as usual.
            StreetPass will build a list of Mastodon users made up of the
            websites you go to.
          </p>

          <p className="mt-5">
            ❤️ StreetPass is made possible by open web{" "}
            <a
              href="http://microformats.org/wiki/rel-me"
              className="text-purple underline"
            >
              identity verification standards
            </a>
            .
          </p>
        </div>

        <Image
          quality={100}
          src={screen1}
          alt=""
          width={1296}
          className="mt-8 w-full max-w-xl"
        />

        <Image
          quality={100}
          src={screen3}
          alt=""
          width={1296}
          className="mt-5 w-full max-w-xl"
        />

        <div className="w-full max-w-lg font-medium">
          <p className="mt-8 mb-8 text-center">
            Made by{" "}
            <a className="text-purple underline" href="https://tylerdeitz.com/">
              Tyler
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
