import { NextRequest } from "next/server";
import { logout } from "@/controllers/auth";

export async function POST(req: NextRequest) {
  return logout(req);
}
