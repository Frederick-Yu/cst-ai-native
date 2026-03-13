"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IndustryType, ContractStatus } from "@prisma/client";

const UpdateCustomerSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, "고객사명은 필수입니다"),
  industryType: z.nativeEnum(IndustryType),
  contractStatus: z.nativeEnum(ContractStatus),
  description: z.string().optional(),
  change_reason: z.string().min(5, "변경 사유는 5자 이상 입력해야 합니다"),
});

export async function updateCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const parsed = UpdateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
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

    revalidatePath(`/customers/${parsed.data.customerId}`);
    revalidatePath("/customers");
    redirect(`/customers/${parsed.data.customerId}`);
  } catch (error) {
    throw error;
  }
}

const CreateCustomerSchema = z.object({
  name: z.string().min(1, "고객사명은 필수입니다"),
  industryType: z.nativeEnum(IndustryType),
  contractStatus: z.nativeEnum(ContractStatus),
  description: z.string().optional(),
});

export async function createCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const parsed = CreateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

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

    revalidatePath("/customers");
    redirect(`/customers/${customer.id}`);
  } catch (error) {
    // redirect()는 내부적으로 throw를 사용하므로 re-throw 필요
    throw error;
  }
}
