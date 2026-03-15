"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils";

const RevealPasswordSchema = z.object({
  systemInfoId: z.string().min(1, "시스템 정보 ID가 필요합니다"),
  accessReason: z.string().min(5, "조회 사유는 5자 이상 입력해야 합니다"),
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
    return { success: false, error: "인증이 필요합니다" };
  }

  const parsed = RevealPasswordSchema.safeParse({ systemInfoId, accessReason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
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

    if (!result.found) return { success: false, error: "시스템 정보를 찾을 수 없습니다" };
    if (!result.hasPassword) return { success: false, error: "저장된 비밀번호가 없습니다" };
    return { success: true, passwordHash: result.passwordHash };
  } catch (error) {
    console.error("[revealPassword]", getErrorMessage(error));
    return { success: false, error: "조회 중 오류가 발생했습니다" };
  }
}
