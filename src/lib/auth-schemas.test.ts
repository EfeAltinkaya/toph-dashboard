import { describe, it, expect } from "vitest";
import { SignupSchema, LoginSchema, ChangePasswordSchema } from "./auth-schemas";

describe("SignupSchema", () => {
  it("accepts a valid manager signup", () => {
    const result = SignupSchema.safeParse({
      role: "manager",
      name: "Efe Altinkaya",
      email: "efe@bayranch.com",
      password: "farmpassword123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid worker signup with a join code", () => {
    const result = SignupSchema.safeParse({
      role: "worker",
      name: "Carlos M.",
      email: "carlos@example.com",
      password: "farmpassword123",
      joinCode: "BAYRANCH",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a worker signup with no join code", () => {
    const result = SignupSchema.safeParse({
      role: "worker",
      name: "Carlos M.",
      email: "carlos@example.com",
      password: "farmpassword123",
      joinCode: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = SignupSchema.safeParse({
      role: "manager",
      name: "Efe",
      email: "efe@bayranch.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = SignupSchema.safeParse({
      role: "manager",
      name: "Efe",
      email: "not-an-email",
      password: "farmpassword123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name that's only whitespace", () => {
    const result = SignupSchema.safeParse({
      role: "manager",
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
