"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { registryConnectionMeta } from "@/lib/status";
import type { RegistryAccount, RegistryConnectionStatus } from "@/types/registry";

const resultCases: RegistryConnectionStatus[] = ["success", "auth_failed", "push_denied", "namespace_missing", "tls_ca_required"];

export function RegistryConnectionTester({ registries }: { registries: RegistryAccount[] }) {
  const [selected, setSelected] = useState<RegistryConnectionStatus>("success");
  const [saveResult, setSaveResult] = useState<"idle" | "success" | "failed">("idle");
  const meta = registryConnectionMeta[selected];
  const canSave = selected === "success";

  function saveConfig() {
    setSaveResult(canSave ? "success" : "failed");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-blue-100 bg-blue-50/70 p-4 text-sm leading-7 text-slate-600">
        当前为前端演示：测试连接用于模拟登录和 push 权限探测。正式版本建议后端先测试连接，成功后才允许保存；失败时明确返回认证失败、无 push 权限、项目不存在或证书配置问题。
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="label">仓库类型</span>
          <Select
            defaultValue="harbor"
            options={[
              { value: "aliyun_acr", label: "阿里云 ACR", description: "Registry V2 push 预设" },
              { value: "tencent_tcr", label: "腾讯云 TCR", description: "Registry V2 push 预设" },
              { value: "volcengine", label: "火山云", description: "Registry V2 push 预设" },
              { value: "huawei_swr", label: "华为云 SWR", description: "Registry V2 push 预设" },
              { value: "harbor", label: "自建 Harbor", description: "自建 Registry / 项目需提前存在" },
              { value: "generic", label: "通用 Docker Registry", description: "通用 Registry V2 push" }
            ]}
          />
        </label>
        <label className="field">
          <span className="label">Registry 地址</span>
          <input className="input" defaultValue="registry.example.com" />
        </label>
        <label className="field">
          <span className="label">Namespace / Project</span>
          <input className="input" defaultValue="platform" />
        </label>
        <label className="field">
          <span className="label">用户名 / Robot Account</span>
          <input className="input" defaultValue="robot$imgpull-poc" />
        </label>
        <label className="field md:col-span-2">
          <span className="label">密码 / Token</span>
          <input className="input" value="演示环境不保存真实凭据" readOnly />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {resultCases.map((result) => (
          <Button key={result} onClick={() => { setSelected(result); setSaveResult("idle"); }} variant={selected === result ? "primary" : "secondary"}>
            {registryConnectionMeta[result].label}
          </Button>
        ))}
        <Button onClick={saveConfig} variant={canSave ? "primary" : "warning"}>
          保存配置
        </Button>
      </div>

      <div className={`rounded-[10px] border p-4 ${canSave ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-black">测试连接结果</span>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <p className="m-0 text-sm leading-7 text-muted">
          目标 namespace / project 必须提前存在。Harbor 自签名证书需要管理员在 Worker 节点配置可信 CA。
        </p>
        {saveResult === "success" ? (
          <div className="mt-3 rounded-[10px] border border-green-200 bg-white px-3 py-2 text-sm font-bold text-green-700">
            保存成功：连接测试通过，仓库配置已加入演示列表。
          </div>
        ) : null}
        {saveResult === "failed" ? (
          <div className="mt-3 rounded-[10px] border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700">
            保存失败：{meta.label}。请根据提示修正凭据、权限、namespace / project 或证书配置后再保存。
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {registries.map((registry) => (
          <div className="rounded-[10px] border border-borderSoft bg-white p-4 shadow-soft" key={registry.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-black">{registry.name}</div>
              <Badge tone={registryConnectionMeta[registry.status].tone}>{registryConnectionMeta[registry.status].label}</Badge>
            </div>
            <div className="mt-2 break-all text-sm leading-6 text-muted">{registry.endpoint}/{registry.namespace}</div>
            <div className="mt-2 text-sm text-slate-600">{registry.remark}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
