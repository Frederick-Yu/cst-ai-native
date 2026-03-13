"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AssetType, ServiceEnv } from "@prisma/client";

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
  } catch {
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}
