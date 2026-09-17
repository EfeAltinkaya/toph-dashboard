import { describe, it, expect } from "vitest";
import { SignupSchema, LoginSchema, ChangePasswordSchema } from "./auth-schemas";

describe("SignupSchema", () => {
  it("accepts a valid signup", () => {
    const result = SignupSchema.safeParse({
      name: "Efe Altinkaya",
      email: "efe@bayranch.com",
      password: "farmpassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = SignupSchema.safeParse({
      name: "Efe",
      email: "efe@bayranch.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = SignupSchema.safeParse({
      name: "Efe",
      email: "not-an-email",
      password: "farmpassword123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name that's only whitespace", () => {
    const result = SignupSchema.safeParse({
      name: "   ",
      email: "efe@bayranch.com",
      password: "farmpassword123",
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginSchema", () => {
  it("requires a non-empty password but doesn't enforce length", () => {
    // Login shouldn't reveal password policy to an attacker probing with a
    // short guess — only signup/change-password enforce the 8-char minimum.
    expect(LoginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(LoginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("ChangePasswordSchema", () => {
  it("rejects when the new password and confirmation don't match", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "newpassword123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching, sufficiently long passwords", () => {
    const result = ChangePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "newpassword123",
      confirmPassword: "newpassword123",
    });
    expect(result.success).toBe(true);
  });
});
