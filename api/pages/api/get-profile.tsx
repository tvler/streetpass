import type { NextApiRequest, NextApiResponse } from "next";
import * as crypto from "node:crypto";
import type { GetProfile } from "../../../constants";
import {
  convertStringsToUrls,
  getPrivateKey,
  MAX_CACHE_TIME,
} from "../../util";

export const config = {
  runtime: "nodejs",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetProfile>
) {
  try {
    if (typeof req.query.url !== "string") {
      throw new Error();
    }

    const foreignTarget = new URL(req.query.url);

    // https://github.com/michaelcpuckett/activitypub-core/blob/1cca3bb1355fffd56a67f6672712a2b133d8d79e/packages/activitypub-core-crypto-node/src/getHttpSignature.ts#L5
    const httpSignature = ((): {
      dateHeader: string;
      signatureHeader: string;
    } => {
      const foreignDomain = foreignTarget.hostname;
      const foreignPathName = foreignTarget.pathname;
      const dateString = new Date().toUTCString();
      const signer = crypto.createSign("sha256");
      const stringToSign = `(request-target): get ${foreignPathName}\nhost: ${foreignDomain}\ndate: ${dateString}`;
      signer.update(stringToSign);
      signer.end();
      const signature = signer.sign(getPrivateKey());
      const signature_b64 = signature.toString("base64");
      const signatureHeader = `keyId="${"https://streetpass.social/users/streetpass"}#main-key",algorithm="rsa-sha256",headers="(request-target) host date",signature="${signature_b64}"`;

      return {
        dateHeader: dateString,
        signatureHeader,
      };
    })();

    const fetchedEntityResp = await fetch(foreignTarget, {
      headers: {
        Accept: `application/ld+json; profile="https://www.w3.org/ns/activitystreams"`,
        date: httpSignature.dateHeader,
        signature: httpSignature.signatureHeader,
      },
    });

    if (!fetchedEntityResp.ok) {
      throw new Error();
    }

    const fetchedEntity: unknown = await fetchedEntityResp.json();

    if (!fetchedEntity) {
      throw new Error();
    }

    if (!(typeof fetchedEntity === "object")) {
      throw new Error();
    }

    if (!("id" in fetchedEntity)) {
      throw new Error();
    }

    const entity = convertStringsToUrls(fetchedEntity);

    if (!entity.id) {
      throw new Error();
    }

    let avatarUrl: GetProfile["avatarUrl"] = null;
    if ("icon" in entity && !!entity.icon) {
      if (entity.icon instanceof URL) {
        avatarUrl = entity.icon;
      } else if (
        "type" in entity.icon &&
        entity.icon.type === "Image" &&
        entity.icon.url instanceof URL
      ) {
        avatarUrl = entity.icon.url;
      }
    }

    let username: GetProfile["username"] = null;
    if ("preferredUsername" in entity && entity.preferredUsername) {
      username = `@${entity.preferredUsername}@${entity.id.hostname}`;
    }

    let name: GetProfile["name"] = entity.name ?? null;

    const maxAge = 30 * 60; // 30 min
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${maxAge}, stale-while-revalidate=${MAX_CACHE_TIME}, must-revalidate, max-age=0`
    );
    res.json({
      id: entity.id,
      avatarUrl,
      username,
      name,
    });
  } catch (err) {
    res.status(500).end();
  }
}
