import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  sendMagicLink: (email: string) => api.post("/auth/magic-link", { email }),

  verifyToken: (token: string, email: string) =>
    api.get(`/auth/verify?token=${token}&email=${encodeURIComponent(email)}`),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),
};

// ─── Applications (Admin) ────────────────────────────────────────────────────

export interface ApplicationFilters {
  applicantProgressStatus?: string | string[];
  adminQualificationStatus?: string | string[];
  databaseStatus?: string | string[];
  deckUploaded?: string;
  lastActivityFrom?: string;
  lastActivityTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: string;
}

export const applicationsApi = {
  list: (filters: ApplicationFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") return;
      if (Array.isArray(val)) {
        val.forEach((v) => params.append(key, v));
      } else {
        params.append(key, String(val));
      }
    });
    return api.get(`/applications?${params.toString()}`);
  },

  getDetail: (id: string) => api.get(`/applications/${id}`),

  updateQualificationStatus: (id: string, status: string) =>
    api.patch(`/applications/${id}/qualification-status`, { status }),

  updateDatabaseStatus: (id: string, status: string) =>
    api.patch(`/applications/${id}/database-status`, { status }),

  changeOwner: (id: string, ownerId: string) =>
    api.patch(`/applications/${id}/owner`, { ownerId }),

  addNote: (id: string, note: string) =>
    api.post(`/applications/${id}/notes`, { note }),

  getAuditLog: (id: string, page = 1, limit = 50) =>
    api.get(`/applications/${id}/audit-log?page=${page}&limit=${limit}`),

  exportCsv: (filters: ApplicationFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, String(val));
      }
    });
    return api.get(`/applications/export/csv?${params.toString()}`, {
      responseType: "blob",
    });
  },

  bulkAction: (action: string, applicationIds: string[]) =>
    api.post("/applications/bulk-action", { action, applicationIds }),

  uploadFile: (
    id: string,
    fileType: "deck" | "logo" | "headshot",
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/applications/${id}/upload/${fileType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─── Applications (GP-facing) ──────────────────────────────────────────────────

export interface GpStep1Payload {
  companyName?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  companyWebsite?: string;
  headquarters?: string;
  yearFounded?: number | string;
  legalStructure?: string;
}

export const gpApplicationsApi = {
  /**
   * Create or get the logged-in GP's own application draft (idempotent).
   */
  createOrGet: () => api.post("/applications"),

  /**
   * Discard current draft and create a fresh one.
   */
  reset: () => api.post("/applications/reset"),

  /**
   * Get the logged-in GP's own application (or 404 if not created yet).
   */
  getMy: () => api.get("/applications/my"),

  /**
   * Save a specific step of the GP application.
   */
  saveStep: (applicationId: string, step: number, data: unknown) =>
    api.put(`/applications/${applicationId}/step/${step}`, data),

  /**
   * Final submission of the application.
   */
  submit: (applicationId: string) =>
    api.post(`/applications/${applicationId}/submit`),

  /**
   * Request access to an existing application (company domain conflict scenario).
   */
  requestAccess: (applicationId: string) =>
    api.post(`/applications/request-access/${applicationId}`),
};

// ─── Reviewers ───────────────────────────────────────────────────────────────

export const reviewersApi = {
  assign: (applicationIds: string[], reviewerIds: string[]) =>
    api.post("/reviewers/assign", { applicationIds, reviewerIds }),

  getMyAssignments: () => api.get("/reviewers/assignments"),
};
