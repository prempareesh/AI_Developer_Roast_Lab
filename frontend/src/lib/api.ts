import axios from "axios";

console.log("API BASE URL:", process.env.NEXT_PUBLIC_API_URL);

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://ai-developer-roast-lab.onrender.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;