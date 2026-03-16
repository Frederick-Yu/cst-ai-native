"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth";
import { Prisma } from "@prisma/client";
import { getErrorMessage } from "@/shared/lib/utils";
import { messages as m } from "@/shared/messages";
import { type FieldErrors } from "@/shared/lib/form";
import { CreateHistorySchema, UpdateHistorySchema, DeleteHistorySchema } from "../schemas/history";

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

export async function updateHistory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const parsed = UpdateHistorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.history.update({
        where: { id: parsed.data.historyId },
        data: {
          eventType: parsed.data.eventType,
          title: parsed.data.title,
          content: parsed.data.content,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "UPDATE",
          targetData: `History(${parsed.data.title})`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: m.history.notFound };
    }
    console.error("[updateHistory]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }
}

export async function deleteHistory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const parsed = DeleteHistorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.history.delete({
        where: { id: parsed.data.historyId },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "DELETE",
          targetData: `History(${parsed.data.historyTitle})`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: m.history.deleteNotFound };
    }
    console.error("[deleteHistory]", getErrorMessage(error));
    return { success: false, error: m.history.deleteFailed };
  }
}
