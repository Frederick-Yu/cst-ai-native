import { z } from "zod";
import { EventType } from "@prisma/client";
import { messages as m } from "@/shared/messages";

export const CreateHistorySchema = z.object({
  customerId: z.string().min(1),
  eventType: z.nativeEnum(EventType),
  title: z.string().min(1, m.history.titleRequired),
  content: z.string().min(1, m.history.contentRequired),
});

export const UpdateHistorySchema = z.object({
  historyId: z.string().min(1),
  customerId: z.string().min(1),
  eventType: z.nativeEnum(EventType),
  title: z.string().min(1, m.history.titleRequired),
  content: z.string().min(1, m.history.contentRequired),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});

export const DeleteHistorySchema = z.object({
  historyId: z.string().min(1),
  customerId: z.string().min(1),
  historyTitle: z.string().min(1),
  change_reason: z.string().min(5, m.common.changeReasonMin),
});
