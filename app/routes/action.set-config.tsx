import { sendServer } from "@/services/api";

export async function action({ request }: any) {
  const data = await request.json();
  await sendServer.post("set-config", data);
  return new Response(null);
}
