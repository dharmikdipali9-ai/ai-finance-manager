import axios from "axios";

const API = axios.create({
    baseURL: "https://ai-finance-manager-h6jl.onrender.com/"
});

// 🔥 ADD THIS INTERCEPTOR
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;