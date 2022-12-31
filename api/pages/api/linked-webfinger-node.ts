import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const test = await fetch(
    "https://mastodon.social/.well-known/webfinger?resource=https%3A%2F%2Fmastodon.social%2F%40tvler",
    {
      headers: {
        "user-agent": "undici",
        "sec-fetch-mode": "cors",
      },
    }
  );
  const test2 = await test.text();

  res.status(200).json({ text: test2 });
}
