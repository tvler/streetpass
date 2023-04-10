import { GetServerSideProps } from "next";
import * as crypto from "node:crypto";
import type { AP } from "activitypub-core-types";
import { getPrivateKey, MAX_CACHE_TIME } from "../../../util";

export default function Page() {
  return null;
}

/*
{
  '@context': [
    'https://www.w3.org/ns/activitystreams',
    'https://w3id.org/security/v1',
    {
      manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',
      toot: 'http://joinmastodon.org/ns#',
      featured: [Object],
      featuredTags: [Object],
      alsoKnownAs: [Object],
      movedTo: [Object],
      schema: 'http://schema.org#',
      PropertyValue: 'schema:PropertyValue',
      value: 'schema:value',
      discoverable: 'toot:discoverable',
      Device: 'toot:Device',
      Ed25519Signature: 'toot:Ed25519Signature',
      Ed25519Key: 'toot:Ed25519Key',
      Curve25519Key: 'toot:Curve25519Key',
      EncryptedMessage: 'toot:EncryptedMessage',
      publicKeyBase64: 'toot:publicKeyBase64',
      deviceId: 'toot:deviceId',
      claim: [Object],
      fingerprintKey: [Object],
      identityKey: [Object],
      devices: [Object],
      messageFranking: 'toot:messageFranking',
      messageType: 'toot:messageType',
      cipherText: 'toot:cipherText',
      suspended: 'toot:suspended',
      Hashtag: 'as:Hashtag',
      focalPoint: [Object]
    }
  ],
  id: 'https://mastodon.social/users/tvler',
  type: 'Person',
  following: 'https://mastodon.social/users/tvler/following',
  followers: 'https://mastodon.social/users/tvler/followers',
  inbox: 'https://mastodon.social/users/tvler/inbox',
  outbox: 'https://mastodon.social/users/tvler/outbox',
  featured: 'https://mastodon.social/users/tvler/collections/featured',
  featuredTags: 'https://mastodon.social/users/tvler/collections/tags',
  preferredUsername: 'tvler',
  name: 'tvler',
  summary: '<p>software engineer working on mastodon discovery tool <a href="https://mastodon.social/tags/streetpass" class="mention hashtag" rel="tag">#<span>streetpass</span></a>. echo park, los angeles. 🏳️‍🌈</p>',
  url: 'https://mastodon.social/@tvler',
  manuallyApprovesFollowers: false,
  discoverable: true,
  published: '2017-05-09T00:00:00Z',
  devices: 'https://mastodon.social/users/tvler/collections/devices',
  publicKey: {
    id: 'https://mastodon.social/users/tvler#main-key',
    owner: 'https://mastodon.social/users/tvler',
    publicKeyPem: '-----BEGIN PUBLIC KEY-----\n' +
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0P2PujZlUtpF+qL5in/I\n' +
      'J35p0LihDNmOzNwYRwo52Hh+VMfFjYHTmBpezvRJPK5HTG8McDL9GeDhlhlxuBiC\n' +
      'sV1HXSS0ysamZJ2AAZ0OVJo15PVuJgNRHv1Wkt4u5hiA2wkFZBrrmJakLZt2dNxv\n' +
      'UYM/H8nRETsJusAGUgm87jZ/GzwZrqmf7z5KNYiML5RA6ShyX692QVa9Lsdpm38R\n' +
      'qp4fLDCqrPghtO+8a1P562C9OJbUbpf3KoMD6DSd7VMUBzFcs3nRM+PDGTVb3Mtt\n' +
      'kT6bdueJN4SbjTSzrabz0h4veOAl99rHf7xVHeOJLKtlfXeX3ZeZgzScgVp16TGK\n' +
      'zQIDAQAB\n' +
      '-----END PUBLIC KEY-----\n'
  },
  tag: [
    {
      type: 'Hashtag',
      href: 'https://mastodon.social/tags/streetpass',
      name: '#streetpass'
    }
  ],
  attachment: [
    {
      type: 'PropertyValue',
      name: 'Website',
      value: '<a href="https://www.tylerdeitz.com" target="_blank" rel="nofollow noopener noreferrer me"><span class="invisible">https://www.</span><span class="">tylerdeitz.com</span><span class="invisible"></span></a>'
    },
    {
      type: 'PropertyValue',
      name: 'StreetPass',
      value: '<a href="https://streetpass.social" target="_blank" rel="nofollow noopener noreferrer me"><span class="invisible">https://</span><span class="">streetpass.social</span><span class="invisible"></span></a>'
    },
    {
      type: 'PropertyValue',
      name: 'GitHub',
      value: '<a href="https://github.com/tvler" target="_blank" rel="nofollow noopener noreferrer me"><span class="invisible">https://</span><span class="">github.com/tvler</span><span class="invisible"></span></a>'
    },
    {
      type: 'PropertyValue',
      name: 'Are.na',
      value: '<a href="https://www.are.na/tyler-deitz" target="_blank" rel="nofollow noopener noreferrer me"><span class="invisible">https://www.</span><span class="">are.na/tyler-deitz</span><span class="invisible"></span></a>'
    }
  ],
  endpoints: { sharedInbox: 'https://mastodon.social/inbox' },
  icon: {
    type: 'Image',
    mediaType: 'image/jpeg',
    url: 'https://files.mastodon.social/accounts/avatars/000/134/637/original/12a3113b9c82b17a.jpeg'
  }
}
*/

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
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

  context.res.setHeader(
    "Cache-Control",
    `public, s-maxage=${MAX_CACHE_TIME}, must-revalidate, max-age=0`
  );
  context.res.setHeader("Content-Type", "application/json");
  context.res.write(JSON.stringify(actor));
  context.res.end();
  return { props: {} };
};
