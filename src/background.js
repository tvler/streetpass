// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, async () => {
    // Declare a rule to enable the action on example.com pages
    let exampleRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          // pageUrl: { hostSuffix: "tylerdeitz.com" },
          css: ["link[rel=me]"],
        }),
      ],
      actions: [
        // new chrome.declarativeContent.ShowAction()
        new chrome.declarativeContent.SetIcon({
          imageData: await loadImageData("icon.png"),
        }),
      ],
    };

    // Finally, apply our new array of rules
    let rules = [exampleRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);

    console.log("added rules");
  });
});

// SVG icons aren't supported yet
async function loadImageData(url) {
  const img = await createImageBitmap(await (await fetch(url)).blob());
  const { width: w, height: h } = img;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  console.log("here");
  return ctx.getImageData(0, 0, w, h);
}
