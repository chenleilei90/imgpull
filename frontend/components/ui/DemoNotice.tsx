type DemoNoticeTone = "public" | "console" | "admin" | "security";

const toneStyles: Record<DemoNoticeTone, string> = {
  public: "border-blue-100 bg-blue-50/80 text-blue-900",
  console: "border-blue-100 bg-blue-50/80 text-blue-900",
  admin: "border-cyan-100 bg-cyan-50/80 text-cyan-950",
  security: "border-amber-200 bg-amber-50 text-amber-900"
};

const toneLabels: Record<DemoNoticeTone, string> = {
  public: "演示环境",
  console: "演示环境",
  admin: "演示后台",
  security: "凭据安全提醒"
};

const defaultMessage =
  "当前为前端演示版，使用示例数据，不会真实创建任务、充值、同步镜像或保存凭据。";

const securityMessage =
  "请勿在演示环境填写真实仓库密码、Token、AccessKey 或生产凭据。";

export function DemoNotice({
  tone = "public",
  message,
  compact = false
}: {
  tone?: DemoNoticeTone;
  message?: string;
  compact?: boolean;
}) {
  const content = message ?? (tone === "security" ? securityMessage : defaultMessage);

  return (
    <div
      className={`rounded-[10px] border px-4 text-sm font-bold leading-6 shadow-[0_8px_24px_rgba(37,99,235,0.06)] ${toneStyles[tone]} ${
        compact ? "py-2" : "py-3"
      }`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="inline-flex w-fit items-center rounded-full bg-white/75 px-2.5 py-1 text-xs font-black">
          {toneLabels[tone]}
        </span>
        <span>{content}</span>
      </div>
    </div>
  );
}
