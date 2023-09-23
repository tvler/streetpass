import { z } from "zod";

export type MaybePromise<T> = Promise<T> | T;

export const Profile = z.object({
  type: z.literal("profile"),
  profileUrl: z.string(),
  account: z.optional(z.union([z.string(), z.undefined()])),
  avatar: z.optional(z.union([z.string(), z.undefined()])),
});

export type Profile = z.infer<typeof Profile>;

export const Message = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("HREF_PAYLOAD"),
    args: z.object({
      relMeHref: z.string(),
      tabUrl: z.string(),
    }),
  }),
  z.object({
    name: z.literal("FETCH_PROFILE_UPDATE"),
    args: z.object({
      relMeHref: z.string(),
    }),
  }),
]);

export const MessageReturn = {
  HREF_PAYLOAD: z.void(),
  FETCH_PROFILE_UPDATE: z.promise(z.boolean()),
} satisfies Record<Message["name"], unknown>;

export type Message = z.infer<typeof Message>;

export type Target = "chrome" | "firefox" | "safari";

export type NotProfile = { type: "notProfile" };

export type ProfileData = Profile | NotProfile;

export type NotNullNotUndefined = {};

export type HrefData = {
  profileData: ProfileData;
  websiteUrl: string;
  viewedAt: number;
  relMeHref: string;
  updatedAt?: number;
};

export type HrefStore = Map<string, HrefData>;

export type Webfinger = {
  subject: string;
  aliases?: Array<string>;
  properties?: Record<string, string>;
  links?: Array<{
    rel: string;
    type?: string;
    href?: string;
    titles?: Record<string, string>;
    properties?: Record<string, string>;
  }>;
};

export const actionInactive = {
  "16": "/action-inactive-16.png",
  "19": "/action-inactive-19.png",
  "32": "/action-inactive-32.png",
  "38": "/action-inactive-38.png",
} as const satisfies Record<string, string>;

export const actionActive = {
  "16": "/action-active-16.png",
  "19": "/action-active-19.png",
  "32": "/action-active-32.png",
  "38": "/action-active-38.png",
} as const satisfies Record<string, string>;

export const timeToExpireNotProfile = 10 * 60 * 1_000; // 10 min in milliseconds
export const timeToUpdateProfile = 10 * 60 * 1_000; // 10 min in milliseconds
