"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StakeholderRole, Prisma } from "@prisma/client";

const UpdateStakeholderSchema = z.object({
  stakeholderId: z.string().min(1),
  customerId: z.string().min(1),
  name: z.string().min(1, "담당자명은 필수입니다"),
  role: z.nativeEnum(StakeholderRole),
  email: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
  phone: z.string().optional(),
  change_reason: z.string().min(5, "변경 사유는 5자 이상 입력해야 합니다"),
});

export async function updateStakeholder(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const parsed = UpdateStakeholderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.stakeholder.update({
        where: { id: parsed.data.stakeholderId },
        data: {
          name: parsed.data.name,
          role: parsed.data.role,
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "UPDATE",
          targetData: `Stakeholder(${parsed.data.name})`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "수정하려는 담당자를 찾을 수 없습니다" };
    }
    console.error("[updateStakeholder]", error);
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}

const CreateStakeholderSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, "담당자명은 필수입니다"),
  role: z.nativeEnum(StakeholderRole),
  email: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export async function createStakeholder(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData);
  const parsed = CreateStakeholderSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.stakeholder.create({
        data: {
          customerId: parsed.data.customerId,
          name: parsed.data.name,
          role: parsed.data.role,
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "CREATE",
          targetData: `Stakeholder(${parsed.data.name})`,
          accessReason: "담당자 신규 등록",
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    console.error("[createStakeholder]", error);
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}
