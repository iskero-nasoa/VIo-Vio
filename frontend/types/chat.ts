export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  description?: string;
  status: "online" | "offline" | "away";
  statusText?: string;
  phone?: string;
  createdAt: string;
}

export interface Attachment {
  type: "image" | "video";
  url: string;
  filename: string;
  size: number;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string | User;
  text: string;
  attachments?: Attachment[];
  replyTo?: Message;
  status: "sent" | "delivered" | "read";
  createdAt: string;
  updatedAt: string;
  // UI helpers
  senderUsername?: string;
  senderAvatar?: string;
}

export interface Chat {
  _id: string;
  type: "direct" | "group";
  participants: User[];
  messages: Message[]; // Usually only contains the last message in preview
  updatedAt: string;
  createdAt: string;
}

export interface Group {
  _id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: User[];
  admin: string | User;
  messages: Message[];
  updatedAt: string;
  createdAt: string;
}

export interface Supergroup {
  _id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: User[];
  admin: string | User;
  updatedAt: string;
  createdAt: string;
}

export interface Topic {
  _id: string;
  supergroupId: string;
  name: string;
  description?: string;
  messages: Message[];
  updatedAt: string;
  createdAt: string;
}
