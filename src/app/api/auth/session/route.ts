import { NextRequest } from "next/server";
import { session } from "@/controllers/auth";

export async function GET(req: NextRequest) {
  return session(req);
}
