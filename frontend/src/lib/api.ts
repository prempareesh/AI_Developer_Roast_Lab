import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://githubroast-backend-latest.onrender.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;