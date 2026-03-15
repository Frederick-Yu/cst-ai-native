"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StakeholderRole, Prisma } from "@prisma/client";
import { getErrorMessage } from "@/lib/utils";
import { messages as m } from "@/messages";

const UpdateStakeholderSchema = z.object({
  stakeholderId: z.string().min(1),
  customerId: z.string().min(1),
  name: z.string().min(1, m.stakeholder.nameRequired),
  role: z.nativeEnum(StakeholderRole),
  email: z.string().email(m.stakeholder.emailInvalid).optional().or(z.literal("")),
  phone: z.string().optional(),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});

export async function updateStakeholder(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

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
      return { success: false, error: m.stakeholder.notFound };
    }
    console.error("[updateStakeholder]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }
}

const CreateStakeholderSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, m.stakeholder.nameRequired),
  role: z.nativeEnum(StakeholderRole),
  email: z.string().email(m.stakeholder.emailInvalid).optional().or(z.literal("")),
  phone: z.string().optional(),
});

const DeleteStakeholderSchema = z.object({
  stakeholderId: z.string().min(1),
  customerId: z.string().min(1),
  stakeholderName: z.string().min(1),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});

export async function deleteStakeholder(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const parsed = DeleteStakeholderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.stakeholder.delete({
        where: { id: parsed.data.stakeholderId },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "DELETE",
          targetData: `Stakeholder(${parsed.data.stakeholderName})`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);

    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: m.stakeholder.deleteNotFound };
    }
    console.error("[deleteStakeholder]", getErrorMessage(error));
    return { success: false, error: m.stakeholder.deleteFailed };
  }
}

export async function createStakeholder(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

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
    console.error("[createStakeholder]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }
}
