import { db } from "./db";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function getCurrentUser(): CurrentUser {
  const user = db.getUser();
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: "ADMIN",
  };
}

// Full Access: Always allow all operations
export function checkPermission(
  _requiredRole?: string,
  _userRole?: string
): boolean {
  return true;
}

export function requireRole(_requiredRole?: string) {
  return getCurrentUser();
}
