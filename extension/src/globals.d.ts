import type Browser from "webextension-polyfill";
import type { Target } from "./util.js";

declare global {
  const browser: Browser.Browser;
  const __TARGET__: Target;
}
