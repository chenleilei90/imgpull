import {
  activities,
  adminUsers,
  announcements,
  auditLogs,
  dashboardStats,
  errorCodes,
  helpArticles,
  imageTasks,
  pointTransactions,
  rechargeOrders,
  rechargePackages,
  registryAccounts,
  systemHealth,
  userMessages,
  workerNodes
} from "@/lib/mock-data";

export const mockApi = {
  getTasks: () => imageTasks,
  getTask: (id: string) => imageTasks.find((task) => task.id === id) ?? imageTasks[0],
  getRegistries: () => registryAccounts,
  getPointTransactions: () => pointTransactions,
  getRechargePackages: () => rechargePackages,
  getOrders: () => rechargeOrders,
  getWorkers: () => workerNodes,
  getMessages: () => userMessages,
  getActivities: () => activities,
  getErrorCodes: () => errorCodes,
  getAdminUsers: () => adminUsers,
  getAuditLogs: () => auditLogs,
  getAnnouncements: () => announcements,
  getHelpArticles: () => helpArticles,
  getSystemHealth: () => systemHealth,
  getDashboardStats: () => dashboardStats
};
