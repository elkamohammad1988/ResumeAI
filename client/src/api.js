import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  changePassword: (data) =>
    api.post("/auth/change-password", data).then((r) => r.data),
  togglePlan: () => api.post("/auth/toggle-plan").then((r) => r.data),
};

export const resumeApi = {
  generate: (data) => api.post("/resume", data).then((r) => r.data),
  duplicate: (id) =>
    api.post(`/resume/${id}/duplicate`).then((r) => r.data),
  list: () => api.get("/resume/me").then((r) => r.data),
  get: (id) => api.get(`/resume/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/resume/${id}`).then((r) => r.data),
};

export default api;
