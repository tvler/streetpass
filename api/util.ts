import { z } from "zod";

// https://webfinger.net/spec/
export const WebFingerSchema = z.object({
  subject: z.string(),
  aliases: z.optional(z.array(z.string())),
  properties: z.optional(z.record(z.string())),
  links: z.optional(
    z.array(
      z.object({
        rel: z.string(),
        type: z.optional(z.string()),
        href: z.optional(z.string()),
        titles: z.optional(z.record(z.string())),
        properties: z.optional(z.record(z.string())),
      })
    )
  ),
});

export type WebFinger = z.infer<typeof WebFingerSchema>;
