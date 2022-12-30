import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { JSDOM, VirtualConsole } from "jsdom";
import { Webfinger, WebfingerSchema } from "../../util";

const QuerySchema = z.object({
  url: z.string(),
});

type LinkedWebfinger = { webfinger: Webfinger; url: string };
export type LinkedWebfingers = Array<LinkedWebfinger>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LinkedWebfingers>
) {
  try {
    const queryUrl = new URL(QuerySchema.parse(req.query).url);
    const queryUrlHtml = await (await fetch(queryUrl)).text();
    const elements = new JSDOM(queryUrlHtml, {
      // bugfix https://github.com/jsdom/jsdom/issues/2230#issuecomment-466915328
      virtualConsole: new VirtualConsole().on("error", () => {
        // No-op to skip console errors.
      }),
    }).window.document.querySelectorAll("link[rel=me], a[rel=me]");
    const unfilteredLinkedWebfingers = await Promise.allSettled(
      Array.from(elements).map(
        async (element): Promise<LinkedWebfinger | null> => {
          const hrefUnchecked = element.getAttribute("href");
          if (!hrefUnchecked) {
            return null;
          }

          const url = new URL((await fetch(new URL(hrefUnchecked))).url);
          const webfingerUrl = new URL(url.origin);
          webfingerUrl.pathname = ".well-known/webfinger";
          webfingerUrl.searchParams.set("resource", url.toString());
          const webfingerResp = await fetch(webfingerUrl.toString());
          const unparsedWebfingerJson = await webfingerResp.json();
          const webfinger = WebfingerSchema.parse(unparsedWebfingerJson);

          return { webfinger, url: url.toString() };
        }
      )
    );
    const linkedWebfingers: LinkedWebfingers = [];
    for (const linkedWebfinger of unfilteredLinkedWebfingers) {
      if (linkedWebfinger.status === "fulfilled" && !!linkedWebfinger.value) {
        linkedWebfingers.push(linkedWebfinger.value);
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
