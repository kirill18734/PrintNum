const API_BASE = "http://127.0.0.1:5000";

export const sendServer = {
  get: (endpoint = "") => fetch(`${API_BASE}/${endpoint}`),
  post: (endpoint: string, body: Object) =>
    fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
};
