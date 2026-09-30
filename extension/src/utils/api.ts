import { API_BASE } from "./constants";

export const sendServer = {
  get: async (domain = API_BASE, endpoint = "") =>
    fetch(`${domain}/${endpoint}`),
  post: async (endpoint: string, body: Object) =>
    fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
};
