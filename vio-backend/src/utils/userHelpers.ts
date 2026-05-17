import { User } from "@prisma/client";

export function userToPublic(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    description: user.description,
    status: user.status,
    statusText: user.statusText,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}
