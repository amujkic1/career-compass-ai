// Reusable API client for the Spring Boot backend.
// - Injects the Bearer token when present.
// - Handles JSON and multipart/form-data.
// - Clears the session and redirects to /login on 401.
import { authStore } from "./auth-store";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function handleUnauthorized() {
  authStore.clear();
  if (typeof window !== "undefined") {
    const here = window.location.pathname;
    if (!here.startsWith("/login")) {
      window.location.href = `/login?redirect=${encodeURIComponent(here)}`;
    }
  }
}

async function request(path, options = {}, parse = "json") {
  const headers = new Headers(options.headers);
  const token = authStore.getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const isForm = options.body instanceof FormData;
  if (options.body && !isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json, text/plain, */*");

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      0,
      "Could not reach the server. Check your connection and the API base URL.",
    );
  }

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText || "Request failed");
  }

  if (parse === "none") return undefined;
  if (parse === "text") return await res.text();
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  // ----- Auth -----
  login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  register(payload) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ----- Job scraping -----
  scrape(url) {
    return request("/api/ai/scrape", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  },

  // ----- Targets -----
  async listTargets() {
    // Backend GET endpoint may not exist; callers fall back to local cache.
    try {
      return await request("/targets", { method: "GET" });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return await request("/api/targets", { method: "GET" });
      }
      throw e;
    }
  },
  createTarget(payload) {
    return request("/targets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateTarget(id, payload) {
    return request(`/targets/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteTarget(id) {
    return request(`/targets/${id}`, { method: "DELETE" }, "none");
  },

  // ----- AI features -----
  gradeResume(jobId) {
    return request(`/api/ai/grade/${jobId}`, {
      method: "POST",
    });
  },
  interviewQuestions(jobId) {
    return request(`/api/ai/interview-questions/${jobId}`, { method: "POST" });
  },
};

/**
 * Resume upload via XHR so we can report upload progress (fetch can't).
 * Returns the public URL parsed from the backend's plain-text response:
 * "Resume uploaded successfully! Link: {publicUrl}".
 */
export function uploadResume(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/users/resume`);
    const token = authStore.getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 401) {
        handleUnauthorized();
        reject(new ApiError(401, "Your session has expired. Please sign in again."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        const message = xhr.responseText || "Resume uploaded successfully!";
        const match = message.match(/Link:\s*(\S+)/i);
        resolve({ message, publicUrl: match ? match[1] : null });
      } else {
        reject(new ApiError(xhr.status, xhr.responseText || "Upload failed"));
      }
    };
    xhr.onerror = () => reject(new ApiError(0, "Network error while uploading the resume."));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
