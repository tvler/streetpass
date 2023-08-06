import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function GET(request: Request) {
  if (
    new URL(request.url).searchParams.get("resource") !==
    "acct:streetpass@streetpass.social"
  ) {
    notFound();
  }

  return NextResponse.json({
    subject: "acct:streetpass@streetpass.social",
    aliases: ["https://mastodon.social/users/streetpass"],
    links: [
      {
        rel: "self",
        type: "application/activity+json",
        href: "https://mastodon.social/users/streetpass",
      },
    ],
  });
}
