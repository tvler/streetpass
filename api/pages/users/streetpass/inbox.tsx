import { GetServerSideProps } from "next";

import type { AP } from "activitypub-core-types";
import { MAX_CACHE_TIME } from "../../../util";

export default function Page() {
  return null;
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const orderedCollection: AP.OrderedCollection = {
    "@context": ["https://www.w3.org/ns/activitystreams"],
    type: "OrderedCollection",
    orderedItems: [],
  };

  context.res.setHeader(
    "Cache-Control",
    `public, s-maxage=${MAX_CACHE_TIME}, must-revalidate, max-age=0`
  );
  context.res.setHeader("Content-Type", "application/json");
  context.res.write(JSON.stringify(orderedCollection));
  context.res.end();
  return { props: {} };
};
