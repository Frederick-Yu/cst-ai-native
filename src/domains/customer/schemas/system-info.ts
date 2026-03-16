import { z } from "zod";
import { AssetType, ServiceEnv } from "@prisma/client";
import { messages as m } from "@/shared/messages";

export const CreateSystemInfoSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1, m.systemInfo.nameRequired),
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

export const UpdateSystemInfoSchema = z.object({
  systemInfoId: z.string().min(1),
  customerId: z.string().min(1),
  name: z.string().min(1, m.systemInfo.nameRequired),
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
  change_reason: z.string().min(5, m.common.changeReasonMin),
});

export const DeleteSystemInfoSchema = z.object({
  systemInfoId: z.string().min(1),
  customerId: z.string().min(1),
  systemInfoName: z.string().min(1),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});
