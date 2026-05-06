import type { Metadata } from "next";
import "@mdxeditor/editor/style.css";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ImgPull 镜像同步平台",
  description: "面向 DevOps 的容器镜像同步 SaaS 前端演示版",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
