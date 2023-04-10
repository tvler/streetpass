import { AP } from "activitypub-core-types";

export const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLIC_ACTOR = `${ACTIVITYSTREAMS_CONTEXT}#Public`;
export const MAX_CACHE_TIME = 31 * 24 * 60 * 60; // 31 days is the max cache time https://vercel.com/docs/concepts/edge-network/caching

export function getPrivateKey(): string {
  if (!process.env.PRIVATE_KEY) {
    throw new Error();
  }

  const privateKey = process.env.PRIVATE_KEY.split(String.raw`\n`).join("\n");

  return privateKey;
}

// https://github.com/michaelcpuckett/activitypub-core/blob/1cca3bb1355fffd56a67f6672712a2b133d8d79e/packages/activitypub-core-utilities/src/convertStringsToUrls.ts#L4
export function convertStringsToUrls(originalEntity: {
  [key: string]: unknown;
}): AP.Entity {
  const entity: { [key: string]: unknown } = { ...originalEntity };

  for (const [key, value] of Object.entries(entity)) {
    if (!entity) {
      continue;
    }

    if (typeof value === "string") {
      if (value === "as:Public") {
        entity[key] = new URL(PUBLIC_ACTOR);
        continue;
      }
      try {
        if (value.startsWith("http")) {
          entity[key] = new URL(value);
        } else {
          const date = Date.parse(value);

          if (!Number.isNaN(date)) {
            entity[key] = new Date(date);
          }
        }
      } catch (error) {
        continue;
      }
    } else if (value instanceof URL || value instanceof Date) {
      continue;
    } else if (Array.isArray(value)) {
      entity[key] = value.map((item) => {
        if (typeof item === "string") {
          if (item === "as:Public") {
            return new URL(PUBLIC_ACTOR);
          }

          try {
            if (item.startsWith("http")) {
              return new URL(item);
            } else {
              const date = Date.parse(item);

              if (
                !Number.isNaN(date) &&
                item === new Date(date).toISOString()
              ) {
                return new Date(date);
              } else {
                return item;
              }
            }
          } catch (error) {
            return item;
          }
        } else if (Array.isArray(item)) {
          return item.map((arrayItem: AP.Entity) =>
            convertStringsToUrls(arrayItem as { [key: string]: unknown })
          );
        } else if (value && typeof value === "object") {
          return convertStringsToUrls(item);
        } else {
          return item;
        }
      });
    } else if (value && typeof value === "object") {
      entity[key] = convertStringsToUrls(value as { [key: string]: unknown });
    }
  }

  return entity as unknown as AP.Entity;
}
