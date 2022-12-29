const href = document
  .querySelector(":is(link, a)[rel=me]")
  ?.getAttribute("href");

if (href) {
  chrome.runtime.sendMessage(href);
}
