"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/shared/lib/prisma";
import { getErrorMessage } from "@/shared/lib/utils";
import { messages as m } from "@/shared/messages";
import { type FieldErrors } from "@/shared/lib/form";

const SignUpSchema = z
  .object({
    name: z.string().min(1, m.auth.nameRequired),
    email: z.string().email(m.auth.emailInvalid),
    password: z.string().min(8, m.auth.passwordMin),
    confirmPassword: z.string().min(1, m.auth.passwordConfirmRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: m.auth.passwordMismatch,
    path: ["confirmPassword"],
  });

export async function signUp(formData: FormData) {
  const parsed = SignUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return { success: false, error: { email: [m.auth.emailDuplicate] } };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: "VIEWER",
        },
      });
      await tx.auditLog.create({
        data: {
          userId: created.id,
          actionType: "CREATE",
          targetData: `User:${created.id}(${created.name})`,
          accessReason: "신규 회원가입",
        },
      });
    });
  } catch (error) {
    console.error("[signUp]", getErrorMessage(error));
    return { success: false, error: m.auth.signUpFailed };
  }

  redirect("/login?registered=1");
}
