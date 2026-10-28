import { Buffer } from "node:buffer";
import { headers } from "next/headers";

export async function requireAdminAccess() {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;
  const authorization = (await headers()).get("authorization");

  if (!user || !password || authorization !== `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`) {
    throw new Error("Unauthorized");
  }
}
