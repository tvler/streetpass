import "webextension-polyfill";
import { z } from "zod";
import { Message } from "./util/constants";
import { runMessageCallback } from "./util/messageCallbacks";
import { getIconState } from "./util/storage";

browser.runtime.onMessage.addListener(async (msg: unknown) => {
  let message: z.infer<typeof Message>;
  try {
    message = Message.parse(msg);
  } catch (err) {
    console.error(err);
    return;
  }

  try {
    return runMessageCallback(message);
  } catch (err) {
    console.error(err);
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
