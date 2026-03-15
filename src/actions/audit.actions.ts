"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils";
import { messages as m } from "@/messages";
import { type FieldErrors } from "@/lib/form";

const RevealPasswordSchema = z.object({
  systemInfoId: z.string().min(1, m.systemInfo.idRequired),
  accessReason: z.string().min(5, m.systemInfo.accessReasonMin),
});

type RevealPasswordResult =
  | { success: true; passwordHash: string }
  | { success: false; error: string | Record<string, string[]> };

export async function revealPassword(
  systemInfoId: string,
  accessReason: string
): Promise<RevealPasswordResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: m.common.authRequired };
  }

  const parsed = RevealPasswordSchema.safeParse({ systemInfoId, accessReason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const systemInfo = await tx.systemInfo.findUnique({
        where: { id: parsed.data.systemInfoId },
        select: { passwordHash: true, customerId: true, name: true },
      });

      if (!systemInfo) return { found: false as const };
      if (!systemInfo.passwordHash) return { found: true as const, hasPassword: false as const };

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: systemInfo.customerId,
          actionType: "ACCESS",
          targetData: `SystemInfo:${parsed.data.systemInfoId}(${systemInfo.name})`,
          accessReason: parsed.data.accessReason,
        },
      });

      return { found: true as const, hasPassword: true as const, passwordHash: systemInfo.passwordHash };
    });

    if (!result.found) return { success: false, error: m.systemInfo.systemNotFound };
    if (!result.hasPassword) return { success: false, error: m.systemInfo.passwordNotFound };
    return { success: true, passwordHash: result.passwordHash };
  } catch (error) {
    console.error("[revealPassword]", getErrorMessage(error));
    return { success: false, error: m.systemInfo.fetchFailed };
  }
}
