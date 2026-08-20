import axios from "axios";

const backendUrl = (
  import.meta.env.VITE_BACKEND_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");


const api = axios.create({
  baseURL: `${backendUrl}/api`,
  timeout: 30000,
});


api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "foodkindl_access"
      );


    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }


    return config;
  },


  (error) =>
    Promise.reject(error)
);


export default api;