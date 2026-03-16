import { z } from "zod";
import { EventType } from "@prisma/client";
import { messages as m } from "@/shared/messages";

export const CreateHistorySchema = z.object({
  customerId: z.string().min(1),
  eventType: z.nativeEnum(EventType),
  title: z.string().min(1, m.history.titleRequired),
  content: z.string().min(1, m.history.contentRequired),
});
