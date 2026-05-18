import { sendServer } from "@/services/api";

export async function action({ request }) {
  const data = await request.json();
  await sendServer.post("set-config", data);
  return new Response(null);
}
