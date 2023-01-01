/**
 * @typedef {Array<string>} SendRelMeHrefsRet
 */

/**
 * @returns {SendRelMeHrefsRet}
 */
function sendRelMeHrefs() {
  const elements = document.querySelectorAll(":is(link, a)[rel=me]");

  /**
   * @type {Array<string>}
   */
  const hrefs = [];

  for (const element of elements) {
    const href = element.getAttribute("href");
    if (href) {
      hrefs.push(href);
    }
  }

  return hrefs;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /**
   * @type {import('./background.js').RequestRelMeElementsMessage}
   */
  const requestRelMeElementsMessage = "requestRelMeElementsMessage";

  if (message !== requestRelMeElementsMessage) {
    return;
  }

  sendResponse(sendRelMeHrefs());
  return true;
});
