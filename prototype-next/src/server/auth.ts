import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@/domain/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  phone: z.string().min(6, "请输入手机号"),
  password: z.string().min(6, "请输入密码")
});

const roles = ["OWNER", "MANAGER", "STAFF", "VIEWER"] as const;

function normalizeRole(role: string): Role {
  return roles.includes(role as Role) ? (role as Role) : "VIEWER";
}

export async function authenticateCredentials(input: unknown) {
  const data = loginSchema.parse(input);

  try {
    const user = await prisma.user.findUnique({
      where: { phone: data.phone },
      select: {
        id: true,
        brandId: true,
        name: true,
        phone: true,
        passwordHash: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return null;
    }

    return {
      userId: user.id,
      brandId: user.brandId,
      name: user.name,
      phone: user.phone,
      role: normalizeRole(user.role)
    };
  } catch {
    if (process.env.NODE_ENV === "production") {
      throw new Error("数据库连接失败，无法登录");
    }

    const devPhone = process.env.ADMIN_PHONE ?? "17863026867";
    const devPassword = process.env.ADMIN_PASSWORD ?? "change-before-use";
    if (data.phone !== devPhone || data.password !== devPassword) {
      return null;
    }

    return {
      userId: "dev-admin",
      brandId: "seed-brand-id",
      name: "文瑞",
      phone: devPhone,
      role: "OWNER" as Role
    };
  }
}
