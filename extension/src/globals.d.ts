import type Browser from "webextension-polyfill";

declare global {
  const browser: Browser.Browser;
}
