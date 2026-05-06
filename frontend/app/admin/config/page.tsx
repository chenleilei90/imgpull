"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SITE_COMPLIANCE_CONFIG } from "@/lib/constants";

const groups = [
  {
    title: "基础配置",
    rows: ["站点名称：ImgPull 镜像助手", "注册开关：开启", "注册送积分：30"]
  },
  {
    title: "任务配置",
    rows: ["单任务大小限制：20GB", "默认架构策略：all", "最大重试次数：1"]
  },
  {
    title: "计费配置",
    rows: ["积分单价：后台控制", "冻结倍率：1.0", "失败返还策略：全额返还"]
  },
  {
    title: "Worker 配置",
    rows: ["lease TTL：300s", "心跳超时：90s", "最大并发：按节点配置"]
  },
  {
    title: "支付配置",
    rows: ["人工充值：启用", "支付宝：暂未开通", "微信支付：暂未开通"]
  },
  {
    title: "通知配置",
    rows: ["站内消息：开启", "任务结果通知：开启", "充值到账通知：开启"]
  }
];

const complianceFields = [
  ["siteName", "站点名称", SITE_COMPLIANCE_CONFIG.siteName, "用于 Header、Footer 和系统通知展示。"],
  ["siteSlogan", "站点标语", SITE_COMPLIANCE_CONFIG.siteSlogan, "用于官网标题、SEO 和运营物料占位。"],
  ["companyName", "公司名称", SITE_COMPLIANCE_CONFIG.companyName, "当前为占位，正式上线前替换为主体名称。"],
  ["copyrightText", "版权信息", SITE_COMPLIANCE_CONFIG.copyrightText, "统一展示在公共 Footer 和控制台底部。"],
  ["icpRecordNo", "ICP备案号", SITE_COMPLIANCE_CONFIG.icpRecordNo, "正式上线前配置真实 ICP 备案号。"],
  ["icpRecordLink", "ICP备案链接", SITE_COMPLIANCE_CONFIG.icpRecordLink, "默认指向工信部备案系统。"],
  ["policeRecordNo", "公安备案号", SITE_COMPLIANCE_CONFIG.policeRecordNo, "正式上线前按实际备案结果配置。"],
  ["policeRecordLink", "公安备案链接", SITE_COMPLIANCE_CONFIG.policeRecordLink, "默认指向全国互联网安全管理服务平台。"],
  ["termsUrl", "服务条款链接", SITE_COMPLIANCE_CONFIG.termsUrl, "正式上线前应替换为服务条款页面。"],
  ["privacyUrl", "隐私政策链接", SITE_COMPLIANCE_CONFIG.privacyUrl, "正式上线前应替换为隐私政策页面。"],
  ["contactEmail", "客服邮箱", SITE_COMPLIANCE_CONFIG.contactEmail, "用于帮助中心和 Footer 联系入口。"],
  ["contactPhone", "联系电话", SITE_COMPLIANCE_CONFIG.contactPhone, "可选展示项，当前为占位。"],
  ["supportWechat", "客服微信", SITE_COMPLIANCE_CONFIG.supportWechat, "可选展示项，当前为占位。"]
];

export default function AdminConfigPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AdminLayout>
      <div className="section-title">
        <h1>系统配置</h1>
        <p>展示 P0 配置分组和保存入口，真实配置服务在后端接入后启用。</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.title}>
            <CardHeader title={group.title} action={<Badge tone="blue">P0</Badge>} />
            <div className="space-y-2">
              {group.rows.map((row) => (
                <div className="rounded-[10px] border border-borderSoft bg-slate-50 p-3 text-sm font-extrabold text-slate-700" key={row}>
                  {row}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <CardHeader
          title="站点与合规"
          description="用于公共 Footer、备案展示、服务条款、隐私政策和联系方式。当前只做前端演示保存，不接真实后端。"
          action={<Badge tone="cyan">运营配置</Badge>}
        />
        <div className="mb-5 rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          当前不写真实备案号或公司资质。正式上线前需要配置真实 ICP 备案号、公安备案号、服务条款、隐私政策和客服联系方式。
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {complianceFields.map(([key, label, value, help]) => (
            <label className="field" key={key}>
              <span className="label">{label}</span>
              <input className="input" defaultValue={value} name={key} />
              <span className="text-xs leading-5 text-muted">{help}</span>
            </label>
          ))}
          <label className="flex items-center justify-between gap-4 rounded-[12px] border border-borderSoft bg-slate-50 p-4">
            <span>
              <span className="block text-sm font-black text-ink">显示 ICP 备案</span>
              <span className="mt-1 block text-xs leading-5 text-muted">控制 Footer 是否展示 ICP 备案占位。</span>
            </span>
            <input className="h-5 w-5 accent-blue-600" defaultChecked={SITE_COMPLIANCE_CONFIG.showIcp} type="checkbox" />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-[12px] border border-borderSoft bg-slate-50 p-4">
            <span>
              <span className="block text-sm font-black text-ink">显示公安备案</span>
              <span className="mt-1 block text-xs leading-5 text-muted">控制 Footer 是否展示公安备案占位。</span>
            </span>
            <input className="h-5 w-5 accent-blue-600" defaultChecked={SITE_COMPLIANCE_CONFIG.showPoliceRecord} type="checkbox" />
          </label>
        </div>
        {saved ? (
          <div className="mt-5 rounded-[12px] border border-green-200 bg-green-50 p-4 text-sm font-extrabold text-green-700">
            配置已保存到前端演示状态。真实环境需要通过后端 API 持久化。
          </div>
        ) : null}
      </Card>

      <div className="mt-5">
        <Button onClick={() => setSaved(true)} variant="primary">
          保存配置
        </Button>
      </div>
    </AdminLayout>
  );
}
