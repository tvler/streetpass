import { z } from "zod";
import { Webfinger, WebfingerSchema } from "../../util";
import * as cheerio from "cheerio";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const QuerySchema = z.object({
  url: z.string(),
});

type LinkedWebfinger = { webfinger: Webfinger; url: string };
export type LinkedWebfingers = Array<LinkedWebfinger>;

export default async function handler(req: NextRequest) {
  try {
    const queryUrl = new URL(
      QuerySchema.parse({ url: new URL(req.url).searchParams.get("url") }).url
    );
    const queryUrlHtml = await (await fetch(queryUrl)).text();

    const $ = cheerio.load(queryUrlHtml);
    const hrefsUnchecked = $("link[rel=me], a[rel=me]")
      .toArray()
      .map((el): string | null | undefined => {
        return el.attribs.href;
      });

    const unfilteredLinkedWebfingers = await Promise.allSettled(
      hrefsUnchecked.map(
        async (hrefUnchecked): Promise<LinkedWebfinger | null> => {
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
    return new Response(JSON.stringify(linkedWebfingers), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": `public, s-maxage=${cacheTimeSeconds}, stale-while-revalidate=${swrCacheTimeSeconds}, must-revalidate, max-age=0`,
      },
    });
    return;
  } catch (err) {
    return new Response(null, { status: 500 });
  }
}
