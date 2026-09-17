"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";

const BriefingSchema = z.object({
  firstName: z.string().trim().min(1, "firstNameRequired"),
  lastName: z.string().trim().min(1, "lastNameRequired"),
  email: z.email("workEmailInvalid"),
  company: z.string().trim().min(1, "companyRequired"),
  responsibility: z.string().trim().min(1, "responsibilityRequired"),
  context: z.string().trim().min(1, "contextRequired"),
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
