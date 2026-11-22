import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "portfolio_admin";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set.");
  return value;
}

export function adminToken() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", secret()).update(password).digest("hex");
}

export function passwordMatches(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !password) return false;
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function sessionMatches(token: string | undefined) {
  if (!token || !process.env.AUTH_SECRET || !process.env.ADMIN_PASSWORD) return false;
  const expected = adminToken();
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
