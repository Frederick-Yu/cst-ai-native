"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const systemInfo = await prisma.systemInfo.findUnique({
      where: { id: parsed.data.systemInfoId },
      select: { passwordHash: true, customerId: true, name: true },
    });

    if (!systemInfo) {
      return { success: false, error: "시스템 정보를 찾을 수 없습니다" };
    }

    if (!systemInfo.passwordHash) {
      return { success: false, error: "저장된 비밀번호가 없습니다" };
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        customerId: systemInfo.customerId,
        actionType: "ACCESS",
        targetData: `SystemInfo:${parsed.data.systemInfoId}(${systemInfo.name})`,
        accessReason: parsed.data.accessReason,
      },
    });

    return { success: true, passwordHash: systemInfo.passwordHash };
  } catch {
    return { success: false, error: "조회 중 오류가 발생했습니다" };
  }
}
