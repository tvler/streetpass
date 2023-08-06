// https://github.com/michaelcpuckett/activity-kit/blob/master/packages/type-utilities/src/guard.ts

import * as AP from "@activity-kit/types";
import * as narrow from "./narrow";

export function exists(
  value: unknown,
): value is string | number | object | boolean {
  return narrow.exists(value);
}

export function isObject(value: unknown): value is object {
  return narrow.isObject(value);
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return narrow.isPlainObject(value);
}

export function isString(value: unknown): value is string {
  return narrow.isString(value);
}

export function isNumber(value: unknown): value is number {
  return narrow.isNumber(value);
}

export function isBoolean(value: unknown): value is boolean {
  return narrow.isBoolean(value);
}

export function isDate(value: unknown): value is Date {
  return narrow.isDate(value);
}

export function isUrl(value: unknown): value is URL {
  return narrow.isUrl(value);
}

export function isArray(value: unknown): value is Array<unknown> {
  return narrow.isArray(value);
}

export function hasType(value: unknown): value is { type: string | string[] } {
  return narrow.hasType(value);
}

export function hasApType(
  value: unknown,
): value is { type: AP.AnyType | AP.TypeOrArrayWithType<AP.AnyType> } {
  return narrow.hasApType(value);
}

export function isApEntity(value: unknown): value is AP.Entity {
  return narrow.isApEntity(value);
}

export function isApActivity(value: unknown): value is AP.Activity {
  return narrow.isApActivity(value);
}

export function isApCoreObject(value: unknown): value is AP.CoreObject {
  return narrow.isApCoreObject(value);
}

export function isApExtendedObject(value: unknown): value is AP.ExtendedObject {
  return narrow.isApExtendedObject(value);
}

export function isApActor(value: unknown): value is AP.Actor {
  return narrow.isApActor(value);
}

export function isApCollection(value: unknown): value is AP.EitherCollection {
  return narrow.isApCollection(value);
}

export function isApCollectionPage(
  value: unknown,
): value is AP.EitherCollectionPage {
  return narrow.isApCollectionPage(value);
}

export function isApTransitiveActivity(
  value: unknown,
): value is AP.TransitiveActivity<AP.AnyTransitiveActivityType> {
  return narrow.isApTransitiveActivity(value);
}

export function isApType<T extends AP.Entity>(
  value: unknown,
  type: string,
): value is T {
  return narrow.isApType<T>(value, type);
}

export function isApTypeOf<T extends AP.Entity>(
  value: unknown,
  comparison: Record<string, string>,
): value is T {
  return narrow.isApTypeOf<T>(value, comparison);
}
