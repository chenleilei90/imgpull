"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminUsers } from "@/lib/mock-data";

const rechargeCandidates = [
  ...adminUsers.map((user) => ({
    id: user.id,
    account: user.email,
    name: user.email.split("@")[0],
    balance: user.balance,
    frozen: user.frozen
  })),
  { id: "user-chenleilei", account: "chenleilei@example.com", name: "chenleilei", balance: 320, frozen: 0 },
  { id: "user-chen-ops", account: "chen.ops@example.com", name: "chen-ops", balance: 128, frozen: 6 }
];

export function ManualRechargePanel() {
  const [applied, setApplied] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<(typeof rechargeCandidates)[number] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const matches = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    if (selectedUser && keyword === selectedUser.account.toLowerCase()) return [];
    return rechargeCandidates
      .filter((user) => [user.account, user.name, user.id].join(" ").toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [query, selectedUser]);

  function chooseUser(user: typeof rechargeCandidates[number]) {
    setSelectedUser(user);
    setQuery(user.account);
    setApplied(false);
    setSearchOpen(false);
  }

  return (
    <div className="space-y-4 rounded-[10px] border border-borderSoft bg-slate-50 p-4">
      <div className="rounded-[10px] border border-blue-100 bg-blue-50/80 p-3 text-sm font-bold leading-7 text-slate-700">
        输入用户账号、邮箱或名称会在前端演示数据中自动筛选，真实版本应调用后端用户搜索接口，并只返回脱敏字段。
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="field md:col-span-2">
          <span className="label">用户账号</span>
          <div className="relative">
            <input
              className="input"
              placeholder="输入 chen、ops、dev 等关键词搜索用户"
              value={query}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedUser(null);
                setSearchOpen(true);
                setApplied(false);
              }}
              onFocus={() => {
                if (query.trim() && matches.length > 0) setSearchOpen(true);
              }}
            />
            {searchOpen && matches.length > 0 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[10px] border border-borderSoft bg-white shadow-panel">
                {matches.map((user) => (
                  <button
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                    key={user.id}
                    type="button"
                    onClick={() => chooseUser(user)}
                  >
                    <span>
                      <span className="font-black text-ink">{user.name}</span>
                      <span className="ml-2 text-muted">{user.account}</span>
                    </span>
                    <span className="text-xs font-black text-primary">可用 {user.balance}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </label>
        <label className="field">
          <span className="label">金额</span>
          <input className="input" defaultValue="20.00" />
        </label>
        <label className="field">
          <span className="label">到账积分</span>
          <input className="input" defaultValue="200" />
        </label>
        <label className="field">
          <span className="label">支付渠道</span>
          <input className="input" value="manual" readOnly />
        </label>
        <label className="field">
          <span className="label">当前用户余额</span>
          <input className="input" value={selectedUser ? `可用 ${selectedUser.balance} / 冻结 ${selectedUser.frozen}` : "请选择用户"} readOnly />
        </label>
        <label className="field md:col-span-2">
          <span className="label">备注</span>
          <input className="input" defaultValue="线下收款，管理员确认到账" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" disabled={!selectedUser} onClick={() => setApplied(true)}>确认人工充值</Button>
        {applied ? <Badge tone="green">订单 paid / 积分 +200 / 用户已通知 / 操作日志已写入</Badge> : null}
      </div>
    </div>
  );
}
