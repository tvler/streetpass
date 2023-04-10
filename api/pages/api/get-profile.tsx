import type { AP } from "activitypub-core-types";
import type { NextApiRequest, NextApiResponse } from "next";
import * as crypto from "node:crypto";
import { convertStringsToUrls, getPrivateKey } from "../../util";

export const config = {
  runtime: "nodejs",
};

type GetProfile = {
  id: URL;
  avatarUrl: URL | null;
  username: string | null;
  displayName: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetProfile>
) {
  try {
    const foreignTarget = new URL("https://social.chriswb.dev/@chrisw_b");
    // const foreignTarget = new URL("https://mastodon.social/@tvler");

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

    let displayName: GetProfile["displayName"] = entity.name ?? null;

    res.json({
      id: entity.id,
      avatarUrl,
      username,
      displayName,
    });
  } catch (err) {
    res.status(500).end();
  }
}
