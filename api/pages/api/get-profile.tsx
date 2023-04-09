import type { NextApiRequest, NextApiResponse } from "next";
import * as crypto from "node:crypto";
import { getPrivateKey } from "../../util";

export const config = {
  runtime: "nodejs",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const foreignTarget = new URL("https://social.chriswb.dev/@chrisw_b");

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

    const fetchedEntity = await fetchedEntityResp.json();

    res.json(fetchedEntity);
  } catch (err) {
    res.status(500).end();
  }
}
