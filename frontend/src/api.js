import axios from "axios";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "foodkindl_access"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;