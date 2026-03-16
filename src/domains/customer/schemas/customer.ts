import { z } from "zod";
import { IndustryType, ContractStatus } from "@prisma/client";
import { messages as m } from "@/shared/messages";

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, m.customer.nameRequired),
  industryType: z.nativeEnum(IndustryType),
  contractStatus: z.nativeEnum(ContractStatus),
  description: z.string().optional(),
});

export const UpdateCustomerSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, m.customer.nameRequired),
  industryType: z.nativeEnum(IndustryType),
  contractStatus: z.nativeEnum(ContractStatus),
  description: z.string().optional(),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});
