"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth";
import { Prisma } from "@prisma/client";
import { getErrorMessage } from "@/shared/lib/utils";
import { messages as m } from "@/shared/messages";
import { type FieldErrors } from "@/shared/lib/form";
import { UpdateSystemInfoSchema, CreateSystemInfoSchema, DeleteSystemInfoSchema } from "../schemas/system-info";

export async function updateSystemInfo(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const raw = Object.fromEntries(formData);
  const parsed = UpdateSystemInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  // 비밀번호가 비어 있으면 기존 값 유지
  const updateData: Prisma.SystemInfoUpdateInput = {
    name: parsed.data.name,
    assetType: parsed.data.assetType,
    serviceEnv: parsed.data.serviceEnv,
    description: parsed.data.description || null,
    host: parsed.data.host || null,
    port: parsed.data.port ?? null,
    username: parsed.data.username || null,
    ...(parsed.data.passwordHash && { passwordHash: parsed.data.passwordHash }),
  };

  try {
    await prisma.$transaction([
      prisma.systemInfo.update({
        where: { id: parsed.data.systemInfoId },
        data: updateData,
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "UPDATE",
          targetData: `SystemInfo(${parsed.data.name})`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: m.systemInfo.notFound };
    }
    console.error("[updateSystemInfo]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }
}

export async function deleteSystemInfo(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const parsed = DeleteSystemInfoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.systemInfo.delete({
        where: { id: parsed.data.systemInfoId },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "DELETE",
          targetData: `SystemInfo(${parsed.data.systemInfoName})`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: m.systemInfo.deleteNotFound };
    }
    console.error("[deleteSystemInfo]", getErrorMessage(error));
    return { success: false, error: m.systemInfo.deleteFailed };
  }
}

export async function createSystemInfo(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const raw = Object.fromEntries(formData);
  const parsed = CreateSystemInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.systemInfo.create({
        data: {
          customerId: parsed.data.customerId,
          name: parsed.data.name,
          assetType: parsed.data.assetType,
          serviceEnv: parsed.data.serviceEnv,
          description: parsed.data.description || null,
          host: parsed.data.host || null,
          port: parsed.data.port ?? null,
          username: parsed.data.username || null,
          passwordHash: parsed.data.passwordHash || null,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "CREATE",
          targetData: `SystemInfo(${parsed.data.name})`,
          accessReason: "시스템 정보 신규 등록",
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { success: false, error: m.systemInfo.customerNotFound };
    }
    console.error("[createSystemInfo]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }
}
