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
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
  }),
  z.object({
    role: z.literal("worker"),
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    joinCode: z.string().trim().min(1, "Enter your farm's join code."),
  }),
]);

export const LoginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "New passwords don't match.",
    path: ["confirmPassword"],
  });
