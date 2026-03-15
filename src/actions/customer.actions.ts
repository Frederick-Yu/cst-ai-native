"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IndustryType, ContractStatus, Prisma } from "@prisma/client";
import { getErrorMessage } from "@/lib/utils";
import { messages as m } from "@/messages";
import { type FieldErrors } from "@/lib/form";

const UpdateCustomerSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, m.customer.nameRequired),
  industryType: z.nativeEnum(IndustryType),
  contractStatus: z.nativeEnum(ContractStatus),
  description: z.string().optional(),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});

export async function updateCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const parsed = UpdateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.customer.update({
        where: { id: parsed.data.customerId },
        data: {
          name: parsed.data.name,
          industryType: parsed.data.industryType,
          contractStatus: parsed.data.contractStatus,
          description: parsed.data.description || null,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: parsed.data.customerId,
          actionType: "UPDATE",
          targetData: `Customer:${parsed.data.customerId}(${parsed.data.name})`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: m.customer.notFound };
    }
    console.error("[updateCustomer]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }

  revalidatePath(`/customers/${parsed.data.customerId}`);
  revalidatePath("/customers");
  redirect(`/customers/${parsed.data.customerId}`);
}

const CreateCustomerSchema = z.object({
  name: z.string().min(1, m.customer.nameRequired),
  industryType: z.nativeEnum(IndustryType),
  contractStatus: z.nativeEnum(ContractStatus),
  description: z.string().optional(),
});

export async function createCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: m.common.authRequired };

  const parsed = CreateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as FieldErrors };
  }

  let customerId: string;
  try {
    const customer = await prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
        data: {
          name: parsed.data.name,
          industryType: parsed.data.industryType,
          contractStatus: parsed.data.contractStatus,
          description: parsed.data.description || null,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          customerId: created.id,
          actionType: "CREATE",
          targetData: `Customer:${created.id}(${created.name})`,
          accessReason: "고객사 신규 등록",
        },
      });

      return created;
    });

    customerId = customer.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: m.customer.duplicateName };
    }
    console.error("[createCustomer]", getErrorMessage(error));
    return { success: false, error: m.common.saveFailed };
  }

  revalidatePath("/customers");
  return { success: true, customerId };
}
