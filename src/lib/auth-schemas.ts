import * as z from "zod";

// Kept in a plain (non "use server") module so these are importable from
// tests without pulling in Next's server-action restrictions — a "use
// server" file may only export async functions, not schema objects.
// A worker's join code is validated against the Farm table separately
// (schema validation alone can't check the database), but it still has to
// be present and non-empty before we bother with that lookup.
export const SignupSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("manager"),
    name: z.string().trim().min(2, "nameTooShort"),
    email: z.email("invalidEmail"),
    password: z.string().min(8, "passwordTooShort"),
  }),
  z.object({
    role: z.literal("worker"),
    name: z.string().trim().min(2, "nameTooShort"),
    email: z.email("invalidEmail"),
    password: z.string().min(8, "passwordTooShort"),
    joinCode: z.string().trim().min(1, "joinCodeRequired"),
  }),
]);

export const LoginSchema = z.object({
  email: z.email("invalidEmail"),
  password: z.string().min(1, "passwordRequired"),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "currentPasswordRequired"),
    newPassword: z.string().min(8, "newPasswordTooShort"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "passwordsDontMatch",
    path: ["confirmPassword"],
  });
