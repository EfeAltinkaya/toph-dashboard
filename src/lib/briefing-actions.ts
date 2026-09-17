"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";

const BriefingSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  email: z.email("Enter a valid work email."),
  company: z.string().trim().min(1, "Enter your company or farm name."),
  responsibility: z.string().trim().min(1, "Select a responsibility."),
  context: z.string().trim().min(1, "Tell us a bit about what you need."),
});

export type BriefingFormState = { error?: string; success?: boolean } | undefined;

export async function requestBriefing(
  _prevState: BriefingFormState,
  formData: FormData
): Promise<BriefingFormState> {
  const parsed = BriefingSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    company: formData.get("company"),
    responsibility: formData.get("responsibility"),
    context: formData.get("context"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.briefingRequest.create({ data: parsed.data });
  return { success: true };
}
