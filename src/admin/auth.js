// ============================================================
// Admin Auth Utilities
// Sử dụng Access Token ngắn hạn lưu trong memory/sessionStorage.
// Refresh Token dài hạn được server lưu trong HttpOnly Cookie —
// frontend không thể đọc/ghi trực tiếp (chống XSS).
// ============================================================

const ADMIN_TOKEN_KEY      = "admin_token";
const ADMIN_USER_KEY       = "admin_user";
const ADMIN_EXPIRES_AT_KEY = "admin_expires_at";

// ── Đọc/ghi session ──────────────────────────────────────────

export function getAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getAdminUser() {
  try {
    const raw = sessionStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession({ token, user, expiresAt }) {
  try {
    // Lưu Access Token trong sessionStorage (xoá khi đóng tab)
    // KHÔNG dùng localStorage để tránh token bị lộ qua XSS
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token || "");
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user || null));
    sessionStorage.setItem(ADMIN_EXPIRES_AT_KEY, String(expiresAt || 0));
  } catch {
    // ignore storage failures in private mode
  }
}

export function clearAdminSession() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(ADMIN_EXPIRES_AT_KEY);
  } catch {
    // ignore
  }
}

// ── Kiểm tra trạng thái đăng nhập ────────────────────────────

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload    = parts[1].replace(/-/g, "+").replace(/_/g, "/");
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

/** Trả về số ms cho đến khi Access Token hết hạn (0 nếu đã hết) */
function msUntilExpiry() {
  const token = getAdminToken();
  if (!token) return 0;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return 0;
  return Math.max(0, payload.exp * 1000 - Date.now());
}

// ── Refresh Token tự động ────────────────────────────────────

let _refreshPromise = null; // Tránh gửi nhiều request refresh song song

/**
 * Gọi /api/refresh.php để lấy Access Token mới.
 * Server sẽ dùng Refresh Token từ HttpOnly Cookie để xác minh.
 * @returns {Promise<boolean>} true nếu refresh thành công
 */
export async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const response = await fetch("/api/refresh.php", {
        method:      "POST",
        credentials: "include", // Gửi HttpOnly Cookie lên server
        headers:     { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        clearAdminSession();
        return false;
      }

      const payload = await response.json().catch(() => ({}));
      if (!payload?.success || !payload?.token) {
        clearAdminSession();
        return false;
      }

      setAdminSession({
        token:     payload.token,
        user:      payload.user,
        expiresAt: payload.expiresAt,
      });

      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Tự động gia hạn token trước khi hết hạn 5 phút ──────────

let _autoRefreshTimer = null;

export function startAutoRefresh() {
  stopAutoRefresh();
  scheduleNextRefresh();
}

export function stopAutoRefresh() {
  if (_autoRefreshTimer) {
    clearTimeout(_autoRefreshTimer);
    _autoRefreshTimer = null;
  }
}

function scheduleNextRefresh() {
  const remaining = msUntilExpiry();
  if (remaining <= 0) return;

  // Gia hạn trước khi hết hạn 5 phút (300_000ms)
  const delay = Math.max(0, remaining - 5 * 60 * 1000);

  _autoRefreshTimer = setTimeout(async () => {
    const ok = await refreshAccessToken();
    if (ok) {
      scheduleNextRefresh(); // Lên lịch lần tiếp theo
    }
    // Nếu thất bại → người dùng sẽ bị redirect khi gọi API tiếp theo
  }, delay);
}

// ── Gọi API có xác thực ──────────────────────────────────────

/**
 * Wrapper cho fetch() tự động đính kèm Authorization header.
 * Nếu nhận 401, thử refresh rồi retry 1 lần.
 */
export async function adminApi(url, options = {}) {
  const result = await _doAdminRequest(url, options);

  // Thử refresh + retry 1 lần nếu nhận 401
  if (result === "UNAUTHORIZED") {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearAdminSession();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    return _doAdminRequest(url, options, true);
  }

  return result;
}

async function _doAdminRequest(url, options = {}, isRetry = false) {
  const token   = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const nextOptions = { ...options, headers, credentials: "include" };
  const hasBody     = Object.prototype.hasOwnProperty.call(nextOptions, "body");

  if (hasBody && nextOptions.body && !(nextOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    nextOptions.body = JSON.stringify(nextOptions.body);
  }

  const response = await fetch(url, nextOptions);
  const payload  = await response.json().catch(() => ({}));

  if (response.status === 401 && !isRetry) {
    return "UNAUTHORIZED";
  }

  if (response.status === 401 && isRetry) {
    clearAdminSession();
    throw new Error("Phiên đăng nhập đã hết hạn.");
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

// ── Đăng xuất ────────────────────────────────────────────────

/**
 * Gọi server để xoá Refresh Token Cookie, sau đó xoá session cục bộ.
 */
export async function adminLogout() {
  stopAutoRefresh();
  try {
    await fetch("/api/logout.php", {
      method:      "POST",
      credentials: "include",
    });
  } catch {
    // Bỏ qua lỗi mạng — vẫn xoá session local
  } finally {
    clearAdminSession();
  }
}
