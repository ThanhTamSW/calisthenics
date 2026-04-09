const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_USER_KEY = "admin_user";
const ADMIN_EXPIRES_AT_KEY = "admin_expires_at";

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getAdminUser() {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession({ token, user, expiresAt }) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token || "");
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user || null));
    localStorage.setItem(ADMIN_EXPIRES_AT_KEY, String(expiresAt || 0));
  } catch {
    // ignore storage failures in private mode
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem(ADMIN_EXPIRES_AT_KEY);
  } catch {
    // ignore
  }
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

export function isAdminAuthenticated() {
  const token = getAdminToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const exp = Number(payload.exp || 0);
  if (!Number.isFinite(exp) || exp <= 0) return false;

  return exp * 1000 > Date.now();
}

export async function adminApi(url, options = {}) {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const nextOptions = { ...options, headers };
  const hasBody = Object.prototype.hasOwnProperty.call(nextOptions, "body");

  if (hasBody && nextOptions.body && !(nextOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    nextOptions.body = JSON.stringify(nextOptions.body);
  }

  const response = await fetch(url, nextOptions);
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearAdminSession();
  }

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) ? payload.errors.join(". ") : "") ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

