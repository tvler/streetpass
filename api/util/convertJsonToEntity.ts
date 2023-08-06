import * as AP from "@activity-kit/types";
import { cast, guard } from "@/activity-kit-type-utils";

const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLIC_ACTOR = `${ACTIVITYSTREAMS_CONTEXT}#Public`;

/**
 * https://github.com/michaelcpuckett/activity-kit/blob/master/packages/utilities/src/convertJsonToEntity.ts#L10
 * Converts a JSON object to an Entity with deserialized values.
 *
 * @returns The Entity, or null if not an Entity.
 */
export function convertJsonToEntity(
  object: Record<string, unknown>,
): AP.Entity | null {
  return cast.isApEntity(convertObject(object)) ?? null;
}

/**
 * https://github.com/michaelcpuckett/activity-kit/blob/master/packages/utilities/src/convertJsonToEntity.ts#L17
 * Deserializes serialized values in an object into their proper types.
 *
 * @returns The object with deserialized values.
 */
function convertObject(
  object: Record<string, unknown>,
): Record<string, unknown> {
  const converted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(object)) {
    converted[key] = convertUnknown(value);
  }

  return converted;
}

/**
 * https://github.com/michaelcpuckett/activity-kit/blob/master/packages/utilities/src/convertJsonToEntity.ts#L38
 * Deserializes an unknown value into a known type.
 *
 * @returns The deserialized value.
 */
function convertUnknown(value: unknown): unknown {
  if (!guard.exists(value)) {
    return value;
  }

  if (guard.isArray(value)) {
    return value.map(convertUnknown);
  }

  if (guard.isPlainObject(value)) {
    return convertObject(value);
  }

  if (guard.isString(value)) {
    if (value === "as:Public") {
      return new URL(PUBLIC_ACTOR);
    }

    try {
      if (value.startsWith("http")) {
        return new URL(value);
      } else {
        const date = Date.parse(value);

        if (!Number.isNaN(date)) {
          return new Date(date);
        }

        return value;
      }
    } catch (error) {
      return value;
    }
  }

  return value;
}
