"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventType, Prisma } from "@prisma/client";
import { getErrorMessage } from "@/lib/utils";

const CreateHistorySchema = z.object({
  customerId: z.string().min(1),
  eventType: z.nativeEnum(EventType),
  title: z.string().min(1, "제목은 필수입니다"),
  content: z.string().min(1, "내용은 필수입니다"),
});

export async function createHistory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData);
  const parsed = CreateHistorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.history.create({
        data: {
          customerId: parsed.data.customerId,
          userId: session.user.id,
          eventType: parsed.data.eventType,
          title: parsed.data.title,
          content: parsed.data.content,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "CREATE",
          targetData: `History(${parsed.data.title})`,
          accessReason: "고객사 이력 신규 등록",
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { success: false, error: "존재하지 않는 고객사입니다" };
    }
    console.error("[createHistory]", getErrorMessage(error));
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}
