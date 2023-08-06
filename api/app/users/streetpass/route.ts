import { NextResponse } from "next/server";
import * as crypto from "node:crypto";
import * as AP from "@activity-kit/types";
import { getPrivateKey } from "@/util/getPrivateKey";

export async function GET() {
  const publicKeyObject = crypto.createPublicKey(getPrivateKey());
  const publicKeyString = publicKeyObject
    .export({ format: "pem", type: "spki" })
    .toString();
  const actor: AP.Application = {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],
    type: "Application",
    id: new URL("https://streetpass.social/users/streetpass"),
    name: "StreetPass",
    preferredUsername: "streetpass",
    publicKey: {
      id: "https://streetpass.social/users/streetpass#main-key",
      owner: "https://streetpass.social/users/streetpass",
      publicKeyPem: publicKeyString,
    },
    inbox: new URL("https://streetpass.social/users/streetpass/inbox"),
    outbox: new URL("https://streetpass.social/users/streetpass/outbox"),
  };

  return NextResponse.json(actor);
}
