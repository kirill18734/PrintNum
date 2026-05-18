const API_BASE = "http://127.0.0.1:5000";

export const sendServer = {
  get: async (endpoint = "") => await fetch(`${API_BASE}/${endpoint}`),
  post: async (endpoint, body) =>
    await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
};
