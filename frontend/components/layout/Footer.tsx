import Link from "next/link";
import { APP_NAME, SITE_COMPLIANCE_CONFIG } from "@/lib/constants";

const footerColumns = [
  {
    title: "产品",
    links: [
      ["产品介绍", "/product"],
      ["价格会员", "/pricing"],
      ["支持仓库", "/registries"],
      ["错误码中心", "/error-codes"],
      ["帮助中心", "/help"]
    ]
  },
  {
    title: "解决方案",
    links: [
      ["Docker Hub 镜像同步", "/product"],
      ["GHCR 镜像同步", "/product"],
      ["Harbor 私有仓库推送", "/registries"],
      ["阿里云 ACR 推送", "/registries"],
      ["批量镜像导入", "/dashboard/tasks/new"]
    ]
  },
  {
    title: "支持与资源",
    links: [
      ["帮助文档", "/help"],
      ["常见问题", "/help"],
      ["联系我们", "/help"],
      ["系统状态", "/error-codes"],
      ["安全说明", "/product"]
    ]
  },
  {
    title: "公司与法律",
    links: [
      ["服务条款", SITE_COMPLIANCE_CONFIG.termsUrl],
      ["隐私政策", SITE_COMPLIANCE_CONFIG.privacyUrl],
      ["用户协议", SITE_COMPLIANCE_CONFIG.termsUrl],
      ["数据安全说明", "/product"],
      ["联系方式", "/help"]
    ]
  }
];

export function Footer() {
  return (
    <footer className="mt-8 border-t border-blue-100 bg-white text-slate-600">
      <div className="mx-auto w-[min(1240px,calc(100vw-28px))] py-8 md:w-[min(1240px,calc(100vw-40px))] md:py-10">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_2fr]">
          <div>
            <Link className="inline-flex items-center gap-3 text-ink" href="/">
              <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-sm font-black text-white shadow-soft">
                IP
              </span>
              <span>
                <span className="block text-lg font-black">{APP_NAME}</span>
                <span className="block text-xs font-extrabold text-primary">镜像同步控制台</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
              面向 DevOps、云原生工程师和运维团队的镜像同步服务。提交公开镜像地址，推送到用户自己的 ACR、Harbor 或 Docker Registry。
            </p>
            <div className="mt-4 rounded-[10px] border border-blue-100 bg-blue-50/70 p-3 text-xs leading-6 text-slate-600">
              当前为前端演示环境，正式上线前需要接入后端服务、配置真实备案信息、服务条款与隐私政策。
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="m-0 text-sm font-black text-ink">{column.title}</h3>
                <div className="mt-3 space-y-2.5">
                  {column.links.map(([label, href]) => (
                    <Link
                      className="block text-sm font-semibold text-slate-500 transition hover:text-primary"
                      href={href}
                      key={`${column.title}-${label}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-blue-100 pt-5 text-xs font-semibold text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>{SITE_COMPLIANCE_CONFIG.copyrightText}</span>
            <span>公司名称：{SITE_COMPLIANCE_CONFIG.companyName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {SITE_COMPLIANCE_CONFIG.showIcp ? (
              <a className="transition hover:text-primary" href={SITE_COMPLIANCE_CONFIG.icpRecordLink} rel="noreferrer" target="_blank">
                {SITE_COMPLIANCE_CONFIG.icpRecordNo}
              </a>
            ) : null}
            {SITE_COMPLIANCE_CONFIG.showPoliceRecord ? (
              <a className="transition hover:text-primary" href={SITE_COMPLIANCE_CONFIG.policeRecordLink} rel="noreferrer" target="_blank">
                {SITE_COMPLIANCE_CONFIG.policeRecordNo}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function ConsoleLegalNote() {
  return (
    <div className="rounded-[12px] border border-borderSoft bg-slate-50 p-4 text-xs leading-6 text-slate-500">
      <div className="font-black text-slate-700">ImgPull Console</div>
      <div>{SITE_COMPLIANCE_CONFIG.copyrightText}</div>
      <div className="mt-2 flex flex-wrap gap-3 font-bold">
        <Link className="hover:text-primary" href={SITE_COMPLIANCE_CONFIG.termsUrl}>
          服务条款
        </Link>
        <Link className="hover:text-primary" href={SITE_COMPLIANCE_CONFIG.privacyUrl}>
          隐私政策
        </Link>
      </div>
    </div>
  );
}
