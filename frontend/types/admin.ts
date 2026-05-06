export interface AdminUser {
  id: string;
  email: string;
  role: "普通会员" | "专业会员";
  balance: number;
  frozen: number;
  taskCount: number;
  risk: "正常" | "关注" | "限制中";
}

export interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail: string;
}

export interface Activity {
  id: string;
  name: string;
  reward: string;
  status: "进行中" | "已结束" | "草稿";
  rule: string;
}

export interface ErrorCodeDoc {
  code: string;
  meaning: string;
  suggestion: string;
}

export type HelpArticleStatus = "draft" | "published" | "offline";

export type HelpCategoryStatus = "enabled" | "disabled";

export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: HelpCategoryStatus;
  updatedAt: string;
}

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  status: HelpArticleStatus;
  contentMarkdown: string;
  updatedAt: string;
  readingMinutes: number;
  tags: string[];
}
