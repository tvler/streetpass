import * as AP from "@activity-kit/types";
import * as guard from "./guard";

export function exists(value: unknown) {
  return guard.exists(value) ? value : undefined;
}

export function isObject(value: unknown) {
  return guard.isObject(value) ? value : undefined;
}

export function isPlainObject(value: unknown) {
  return guard.isPlainObject(value) ? value : undefined;
}

export function isString(value: unknown) {
  return guard.isString(value) ? value : undefined;
}

export function isBoolean(value: unknown) {
  return guard.isBoolean(value) ? value : undefined;
}

export function isNumber(value: unknown) {
  return guard.isNumber(value) ? value : undefined;
}

export function isDate(value: unknown): Date | undefined {
  return guard.isDate(value) ? value : undefined;
}

export function isUrl(value: unknown): URL | undefined {
  return guard.isUrl(value) ? value : undefined;
}

export function isArray(value: unknown): Array<unknown> | undefined {
  return guard.isArray(value) ? value : undefined;
}

export function hasType(
  value: unknown,
): { type: string | string[] } | undefined {
  return guard.hasType(value) ? value : undefined;
}

export function hasApType(
  value: unknown,
): { type: AP.AnyType | AP.TypeOrArrayWithType<AP.AnyType> } | undefined {
  return guard.hasApType(value) ? value : undefined;
}

export function isApEntity(value: unknown): AP.Entity | undefined {
  return guard.isApEntity(value) ? value : undefined;
}

export function isApActivity(value: unknown): AP.Activity | undefined {
  return guard.isApActivity(value) ? value : undefined;
}

export function isApCoreObject(value: unknown): AP.CoreObject | undefined {
  return guard.isApCoreObject(value) ? value : undefined;
}

export function isApExtendedObject(
  value: unknown,
): AP.ExtendedObject | undefined {
  return guard.isApExtendedObject(value) ? value : undefined;
}

export function isApActor(value: unknown): AP.Actor | undefined {
  return guard.isApActor(value) ? value : undefined;
}

export function isApCollection(
  value: unknown,
): AP.EitherCollection | undefined {
  return guard.isApCollection(value) ? value : undefined;
}

export function isApCollectionPage(
  value: unknown,
): AP.EitherCollectionPage | undefined {
  return guard.isApCollectionPage(value) ? value : undefined;
}

export function isApTransitiveActivity(
  value: unknown,
): AP.TransitiveActivity<AP.AnyTransitiveActivityType> | undefined {
  return guard.isApTransitiveActivity(value) ? value : undefined;
}

export function isApType<T extends AP.Entity>(
  value: unknown,
  type: string,
): T | undefined {
  return guard.isApType<T>(value, type) ? value : undefined;
}

export function isApTypeOf<T extends AP.Entity>(
  value: unknown,
  comparison: Record<string, string>,
): T | undefined {
  return guard.isApTypeOf<T>(value, comparison) ? value : undefined;
}
