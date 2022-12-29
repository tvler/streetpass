import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { JSDOM } from "jsdom";
import { WebFinger, WebFingerSchema } from "../../util";

const QuerySchema = z.object({
  url: z.string(),
});

type LinkedWebFinger = { webFinger: WebFinger; url: string };

type LinkedWebFingers = Array<LinkedWebFinger>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LinkedWebFingers>
) {
  try {
    const queryUrl = new URL(QuerySchema.parse(req.query).url);
    const queryUrlHtml = await (await fetch(queryUrl)).text();
    const elements = new JSDOM(queryUrlHtml).window.document.querySelectorAll(
      "link[rel=me], a[rel=me]"
    );
    const unfilteredLinkedWebFingers = await Promise.allSettled(
      Array.from(elements).map(
        async (element): Promise<LinkedWebFinger | null> => {
          const hrefUnchecked = element.getAttribute("href");
          if (!hrefUnchecked) {
            return null;
          }

          const url = new URL((await fetch(new URL(hrefUnchecked))).url);
          const webFingerUrl = new URL(url.origin);
          webFingerUrl.pathname = ".well-known/webfinger";
          webFingerUrl.searchParams.set("resource", url.toString());
          const webFingerResp = await fetch(webFingerUrl.toString());
          const unparsedWebfingerJson = await webFingerResp.json();
          const webFinger = WebFingerSchema.parse(unparsedWebfingerJson);

          return { webFinger, url: url.toString() };
        }
      )
    );
    const linkedWebfingers: LinkedWebFingers = [];
    for (const linkedWebFinger of unfilteredLinkedWebFingers) {
      if (linkedWebFinger.status === "fulfilled" && !!linkedWebFinger.value) {
        linkedWebfingers.push(linkedWebFinger.value);
      }
    }

    const cacheTimeSeconds = 60 * 60; // 1 hour
    const swrCacheTimeSeconds = 60 * 60 * 24 * 31; // 31 days is the max cache time https://vercel.com/docs/concepts/edge-network/caching
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${cacheTimeSeconds}, stale-while-revalidate=${swrCacheTimeSeconds}, must-revalidate, max-age=0`
    );
    res.status(200).json(linkedWebfingers);
    res.end();
    return;
  } catch (err) {
    console.log(err);
    res.status(500);
    res.end();
    return;
  }
}
