"use client";

const QUOTA_KEY = "jerseygen_quota_v1";
const EMAIL_KEY = "jerseygen_email_v1";

export function getFreeQuota() {
  const raw = process.env.NEXT_PUBLIC_FREE_QUOTA;
  const n = raw ? parseInt(raw, 10) : 5;
  return Number.isFinite(n) && n > 0 ? n : 5;
}

export function getUsedCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(QUOTA_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function incrementUsed() {
  if (typeof window === "undefined") return;
  const next = getUsedCount() + 1;
  localStorage.setItem(QUOTA_KEY, String(next));
}

export function resetQuota() {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUOTA_KEY, "0");
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function setEmail(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearEmail() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(QUOTA_KEY);
}
