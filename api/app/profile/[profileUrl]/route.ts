import { MAX_CACHE_TIME } from "@/constants";
import { convertJsonToEntity } from "@/util/convertJsonToEntity";
import { getPrivateKey } from "@/util/getPrivateKey";
import { NextResponse } from "next/server";
import * as crypto from "node:crypto";

type Profile = {
  id: string;
  avatarUrl: string | null;
  username: string | null;
  name: string | null;
  url: string;
};

// export const revalidate = 30;

export async function GET(
  _request: Request,
  { params }: { params: { profileUrl: string } },
): Promise<NextResponse<Profile>> {
  const foreignTarget = new URL(params.profileUrl);

  // https://github.com/michaelcpuckett/activity-kit/blob/master/packages/crypto-node/src/getHttpSignature.ts#L4
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

  // https://github.com/michaelcpuckett/activity-kit/blob/cc44d46da703d072fee5c5449770cc450e74b331/packages/core/src/queryById.ts#L66
  const fetchedEntityResp = await fetch(foreignTarget, {
    headers: {
      Accept: `application/activity+json`,
      date: httpSignature.dateHeader,
      signature: httpSignature.signatureHeader,
    },
    // next: {
    //   revalidate: 30, // seconds
    // },
  });

  if (!fetchedEntityResp.ok) {
    throw new Error();
  }

  const fetchedEntity: unknown = await fetchedEntityResp.json();

  if (!fetchedEntity) {
    throw new Error();
  }

  const entity = convertJsonToEntity(fetchedEntity as Record<string, unknown>);

  // const entity = await getEntity(params.profileUrl);

  if (!entity?.id) {
    throw new Error();
  }

  let avatarUrl: Profile["avatarUrl"] = null;
  if ("icon" in entity && entity.icon instanceof URL) {
    avatarUrl = entity.icon.toString();
  } else if (
    "icon" in entity &&
    entity.icon &&
    "url" in entity.icon &&
    entity.icon.url
  ) {
    avatarUrl = entity.icon.url.toString();
  }

  let username: Profile["username"] = null;
  if ("preferredUsername" in entity && entity.preferredUsername) {
    username = `@${entity.preferredUsername}@${entity.id.hostname}`;
  }

  let name: Profile["name"] = null;
  if (entity.name) {
    name = entity.name;
  }

  let url: Profile["url"];
  if ("url" in entity && entity.url instanceof URL) {
    url = entity.url.toString();
  } else {
    url = entity.id.toString();
  }

  return NextResponse.json(
    {
      id: entity.id.toString(),
      avatarUrl,
      username,
      name,
      url,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${
          30 * 60
        }, stale-while-revalidate=${MAX_CACHE_TIME}, must-revalidate, max-age=0`,
      },
    },
  );
}
