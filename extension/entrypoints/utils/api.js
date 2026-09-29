const sendServer = {
  get: async (domain = API_BASE, endpoint = "") =>
    fetch(`${domain}/${endpoint}`),
  post: async (endpoint, body) =>
    fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
};
