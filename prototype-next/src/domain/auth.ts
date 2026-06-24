export type Role = "OWNER" | "MANAGER" | "STAFF" | "VIEWER";

export type Permission =
  | "dashboard:read"
  | "store:read"
  | "store:write"
  | "service-group:read"
  | "service-group:write"
  | "product:read"
  | "product:write"
  | "order:read"
  | "order:write"
  | "customer:read"
  | "customer:write"
  | "audit-log:read"
  | "notification:read"
  | "notification:write"
  | "report:read"
  | "channel:read"
  | "channel:write"
  | "photo-album:read"
  | "photo-album:write"
  | "staff:read"
  | "staff:write";

export const rolePermissions: Record<Role, Permission[]> = {
  OWNER: [
    "dashboard:read",
    "store:read",
    "store:write",
    "service-group:read",
    "service-group:write",
    "product:read",
    "product:write",
    "order:read",
    "order:write",
    "customer:read",
    "customer:write",
    "audit-log:read",
    "notification:read",
    "notification:write",
    "report:read",
    "channel:read",
    "channel:write",
    "photo-album:read",
    "photo-album:write",
    "staff:read",
    "staff:write"
  ],
  MANAGER: [
    "dashboard:read",
    "store:read",
    "service-group:read",
    "service-group:write",
    "product:read",
    "product:write",
    "order:read",
    "order:write",
    "customer:read",
    "customer:write",
    "audit-log:read",
    "notification:read",
    "notification:write",
    "report:read",
    "channel:read",
    "channel:write",
    "photo-album:read",
    "photo-album:write",
    "staff:read"
  ],
  STAFF: ["dashboard:read", "store:read", "service-group:read", "product:read", "order:read", "order:write", "customer:read", "photo-album:read", "photo-album:write"],
  VIEWER: ["dashboard:read", "store:read", "service-group:read", "product:read", "order:read", "customer:read", "report:read", "photo-album:read"]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function canAccess(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
