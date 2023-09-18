import "webextension-polyfill";
import { z } from "zod";
import { getIconState, Message, runMessageCallback } from "./util.js";

browser.runtime.onMessage.addListener(async (msg: unknown) => {
  let message: z.infer<typeof Message>;
  try {
    message = Message.parse(msg);
  } catch (err) {
    return;
  }

  try {
    return runMessageCallback(message);
  } catch (err) {
    return;
  }
});

browser.runtime.onInstalled.addListener((details) => {
  getIconState((iconState) => {
    if (details.reason === "install") {
      return { state: "on", unreadCount: iconState.unreadCount };
    }
    return iconState;
  });
});

browser.runtime.onStartup.addListener(() => {
  // Trigger an onChange to set the correct icon
  getIconState((iconState) => iconState);
});
