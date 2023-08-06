// https://github.com/michaelcpuckett/activity-kit/blob/master/packages/type-utilities/src/narrow.ts

import * as AP from "@activity-kit/types";

function isType<T extends AP.Entity>(entity: unknown, type: string) {
  if (!entity || typeof entity !== "object") {
    return false;
  }

  const entityType: string | string[] = (entity as T).type;

  return Array.isArray(entityType)
    ? entityType.includes(type)
    : type === entityType;
}

function isTypeOf<T extends AP.Entity>(
  entity: unknown,
  types: Record<string, string>,
) {
  return Object.values(types).some((type) => isType<T>(entity, type));
}

export function exists(value: unknown) {
  return (
    ["string", "number", "object", "boolean"].includes(typeof value) &&
    value !== null
  );
}

export function isObject(value: unknown) {
  return typeof value === "object" && value !== null;
}

export function isPlainObject(value: unknown) {
  return isObject(value) && Object.getPrototypeOf(value) === Object.prototype;
}

export function isString(value: unknown) {
  return typeof value === "string";
}

export function isNumber(value: unknown) {
  return typeof value === "number" && !isNaN(value);
}

export function isBoolean(value: unknown) {
  return typeof value === "boolean";
}

export function isDate(value: unknown) {
  return value instanceof Date;
}

export function isUrl(value: unknown) {
  return value instanceof URL;
}

export function isArray(value: unknown) {
  return Array.isArray(value);
}

export function hasType(value: unknown) {
  return typeof value === "object" && value !== null && "type" in value;
}

export function hasApType(value: unknown) {
  return hasType(value) && isTypeOf<AP.Entity>(value, AP.AllTypes);
}

export function isApEntity(value: unknown) {
  return hasApType(value);
}

export function isApActivity(value: unknown) {
  return isApEntity(value) && isTypeOf<AP.Activity>(value, AP.ActivityTypes);
}

export function isApCoreObject(value: unknown) {
  return (
    isApEntity(value) && isTypeOf<AP.CoreObject>(value, AP.CoreObjectTypes)
  );
}

export function isApExtendedObject(value: unknown) {
  return (
    isApEntity(value) &&
    isTypeOf<AP.ExtendedObject>(value, AP.ExtendedObjectTypes)
  );
}

export function isApActor(value: unknown) {
  return isApEntity(value) && isTypeOf<AP.Actor>(value, AP.ActorTypes);
}

export function isApCollection(value: unknown) {
  return (
    isApEntity(value) &&
    isTypeOf<AP.EitherCollection>(value, AP.CollectionTypes)
  );
}

export function isApCollectionPage(value: unknown) {
  return (
    isApEntity(value) &&
    isTypeOf<AP.EitherCollectionPage>(value, AP.CollectionPageTypes)
  );
}

export function isApTransitiveActivity(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    isApActivity(value) &&
    "object" in value
  );
}

export function isApType<T extends AP.Entity>(value: unknown, type: string) {
  return isApEntity(value) && isType<T>(value, type);
}

export function isApTypeOf<T extends AP.Entity>(
  value: unknown,
  comparison: Record<string, string>,
) {
  return isApEntity(value) && isTypeOf<T>(value, comparison);
}
