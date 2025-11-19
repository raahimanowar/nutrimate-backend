import { z } from "zod";

export const UserSchema = z.object({
  username: z.string(),
  email: z.email(),
  password: z.string(),
  height: z.number(),
  weight: z.number(),
  address: z.object({
    country: z.string(),
    city: z.string(),
  }),
  profilePic: z.string(),
  dateOfBirth: z.date(),
  role: z.enum(["user", "admin"]).default("user"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
