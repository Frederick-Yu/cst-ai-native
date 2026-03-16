import { EventType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/shared/components/ui/badge";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  INSTALLATION: "구축",
  MAINTENANCE: "유지보수",
  INCIDENT: "장애",
  UPDATE: "업데이트",
  MEETING: "미팅",
  OTHER: "기타",
};

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  INSTALLATION: "bg-teal-100 text-teal-700",
  MAINTENANCE: "bg-blue-100 text-blue-700",
  INCIDENT: "bg-rose-100 text-rose-700",
  UPDATE: "bg-amber-100 text-amber-700",
  MEETING: "bg-purple-100 text-purple-700",
  OTHER: "bg-stone-100 text-stone-600",
};

const EVENT_TYPE_DOT: Record<EventType, string> = {
  INSTALLATION: "bg-teal-500",
  MAINTENANCE: "bg-blue-500",
  INCIDENT: "bg-rose-500",
  UPDATE: "bg-amber-500",
  MEETING: "bg-purple-500",
  OTHER: "bg-stone-400",
};

interface TimelineEntry {
  id: string;
  eventType: EventType;
  title: string;
  content: string;
  createdAt: Date;
  user: { name: string };
}

export function CustomerTimeline({ histories }: { histories: TimelineEntry[] }) {
  if (histories.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-stone-400">
        등록된 이력이 없습니다.
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-stone-200 pl-6" aria-label="고객사 이력 타임라인">
      {histories.map((entry) => (
        <li key={entry.id} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-[9px] mt-1.5 size-4 rounded-full border-2 border-white ${EVENT_TYPE_DOT[entry.eventType]}`}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-xs ${EVENT_TYPE_COLORS[entry.eventType]}`}>
              {EVENT_TYPE_LABELS[entry.eventType]}
            </Badge>
            <h3 className="text-sm font-semibold text-stone-800">{entry.title}</h3>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">{entry.content}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-stone-400">
            <span>{entry.user.name}</span>
            <span>·</span>
            <time dateTime={new Date(entry.createdAt).toISOString()}>
              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true, locale: ko })}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
