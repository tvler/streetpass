import type Browser from "webextension-polyfill";
import type { Target } from "./util/constants";

declare global {
  const browser: Browser.Browser;
  const __TARGET__: Target;
}
