import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { UserMessage } from "@/types/message";

const messageTypeLabel = {
  task: "任务",
  order: "订单",
  points: "积分",
  announcement: "公告"
};

export function MessageList({ messages }: { messages: UserMessage[] }) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <article className="rounded-[10px] border border-borderSoft bg-white p-4 shadow-soft" key={message.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {!message.read ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-label="未读" /> : null}
              <div className="truncate font-black text-ink">{message.title}</div>
            </div>
            <div className="flex gap-2">
              <Badge tone={message.read ? "slate" : "blue"}>{message.read ? "已读" : "未读"}</Badge>
              <Badge tone="cyan">{messageTypeLabel[message.type]}</Badge>
            </div>
          </div>
          <p className="my-2 text-sm leading-7 text-muted">{message.content}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted">{message.time}</span>
            <Link className="font-extrabold text-primary hover:text-primaryHover" href={message.targetUrl}>
              {message.targetText}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
