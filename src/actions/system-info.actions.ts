"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AssetType, ServiceEnv, Prisma } from "@prisma/client";

const UpdateSystemInfoSchema = z.object({
  systemInfoId: z.string().min(1),
  customerId: z.string().min(1),
  name: z.string().min(1, "시스템명은 필수입니다"),
  assetType: z.nativeEnum(AssetType),
  serviceEnv: z.nativeEnum(ServiceEnv),
  description: z.string().optional(),
  host: z.string().optional(),
  port: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(1).max(65535).optional()
  ),
  username: z.string().optional(),
  passwordHash: z.string().optional(),
  change_reason: z.string().min(5, "변경 사유는 5자 이상 입력해야 합니다"),
});

export async function updateSystemInfo(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData);
  const parsed = UpdateSystemInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
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
      return { success: false, error: "수정하려는 시스템 정보를 찾을 수 없습니다" };
    }
    console.error("[updateSystemInfo]", error);
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}

const CreateSystemInfoSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, "시스템명은 필수입니다"),
  assetType: z.nativeEnum(AssetType),
  serviceEnv: z.nativeEnum(ServiceEnv),
  description: z.string().optional(),
  host: z.string().optional(),
  port: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(1).max(65535).optional()
  ),
  username: z.string().optional(),
  passwordHash: z.string().optional(),
});

export async function createSystemInfo(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData);
  const parsed = CreateSystemInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
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
    console.error("[createSystemInfo]", error);
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}
