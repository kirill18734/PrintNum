const URL = "http://127.0.0.1:5000";

export function sendDataServer(endpoint = "", data = {}) {
  return fetch(`${URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((res) => res)
    .catch((error) => {
      throw error;
    });
}
