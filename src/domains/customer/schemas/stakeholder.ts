import { z } from "zod";
import { StakeholderRole } from "@prisma/client";
import { messages as m } from "@/shared/messages";

export const CreateStakeholderSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, m.stakeholder.nameRequired),
  role: z.nativeEnum(StakeholderRole),
  email: z.string().email(m.stakeholder.emailInvalid).optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const UpdateStakeholderSchema = z.object({
  stakeholderId: z.string().min(1),
  customerId: z.string().min(1),
  name: z.string().min(1, m.stakeholder.nameRequired),
  role: z.nativeEnum(StakeholderRole),
  email: z.string().email(m.stakeholder.emailInvalid).optional().or(z.literal("")),
  phone: z.string().optional(),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});

export const DeleteStakeholderSchema = z.object({
  stakeholderId: z.string().min(1),
  customerId: z.string().min(1),
  stakeholderName: z.string().min(1),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});
