import { NextResponse } from "next/server";
import * as AP from "@activity-kit/types";

export async function GET() {
  const orderedCollection: AP.OrderedCollection = {
    "@context": ["https://www.w3.org/ns/activitystreams"],
    type: "OrderedCollection",
    orderedItems: [],
  };

  return NextResponse.json(orderedCollection);
}
