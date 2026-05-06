"use client";

import { useMemo, useState } from "react";
import { MessageList } from "@/components/business/MessageList";
import { UserDashboardLayout } from "@/components/layout/UserDashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { announcements, userMessages } from "@/lib/mock-data";

type MessageTab = "messages" | "announcements";

export default function MessagesPage() {
  const [tab, setTab] = useState<MessageTab>("messages");
  const stationMessages = userMessages.filter((message) => message.type !== "announcement");
  const systemMessages = userMessages.filter((message) => message.type === "announcement");
  const unreadMessages = stationMessages.filter((message) => !message.read).length;
  const unreadAnnouncements = systemMessages.filter((message) => !message.read).length;
  const publishedAnnouncements = useMemo(() => announcements.filter((item) => item.status === "已发布"), []);

  return (
    <UserDashboardLayout>
      <div className="section-title">
        <h1>消息中心</h1>
        <p>站内消息用于任务、订单和积分通知；系统公告用于平台维护、活动和运行说明。未读内容会显示红点提醒。</p>
      </div>
      <Card>
        <CardHeader
          title="消息与公告"
          description="公告由管理员后台发布，普通用户在这里查看；当前仍为前端演示数据。"
        />
        <div className="mb-5 flex flex-wrap gap-2 rounded-[10px] border border-borderSoft bg-slate-50 p-1.5">
          {[
            { key: "messages" as const, label: "站内消息", count: unreadMessages },
            { key: "announcements" as const, label: "系统公告", count: unreadAnnouncements }
          ].map((item) => (
            <button
              className={`relative h-10 rounded-[9px] px-4 text-sm font-black transition ${
                tab === item.key ? "bg-white text-primary shadow-soft" : "text-slate-600 hover:bg-white/70 hover:text-ink"
              }`}
              key={item.key}
              onClick={() => setTab(item.key)}
              type="button"
            >
              {item.label}
              {item.count > 0 ? <span className="ml-2 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" aria-label={`${item.count} 条未读`} /> : null}
            </button>
          ))}
        </div>

        {tab === "messages" ? (
          <MessageList messages={stationMessages} />
        ) : (
          <div className="space-y-3">
            <MessageList messages={systemMessages} />
            <div className="rounded-[10px] border border-blue-100 bg-blue-50/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="font-black text-ink">已发布公告</div>
                <Badge tone="blue">{publishedAnnouncements.length} 条</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {publishedAnnouncements.map((announcement) => (
                  <article className="rounded-[10px] border border-borderSoft bg-white p-4 shadow-soft" key={announcement.id}>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="m-0 text-base font-black text-ink">{announcement.title}</h2>
                      <Badge tone="green">{announcement.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{announcement.summary}</p>
                    <div className="mt-3 text-xs font-bold text-slate-500">{announcement.time}</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </UserDashboardLayout>
  );
}
