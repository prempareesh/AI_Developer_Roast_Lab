import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-developer-roast-lab.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

console.log("API BASE URL:", API.defaults.baseURL);

export default API;