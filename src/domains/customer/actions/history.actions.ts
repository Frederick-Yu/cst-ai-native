"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth";
import { Prisma } from "@prisma/client";
import { getErrorMessage } from "@/shared/lib/utils";
import { messages as m } from "@/shared/messages";
import { type FieldErrors } from "@/shared/lib/form";
import { CreateHistorySchema } from "../schemas/history";

export async function createHistory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const raw = Object.fromEntries(formData);
  const parsed = CreateHistorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
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
      return { success: false, error: m.history.customerNotFound };
    }
    console.error("[createHistory]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }
}
