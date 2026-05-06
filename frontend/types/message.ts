export type MessageType = "task" | "order" | "points" | "announcement";

export interface UserMessage {
  id: string;
  title: string;
  type: MessageType;
  read: boolean;
  time: string;
  content: string;
  targetText: string;
  targetUrl: string;
}
