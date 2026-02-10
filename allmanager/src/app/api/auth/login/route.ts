import { NextRequest } from "next/server";
import { login } from "@/controllers/auth";

export async function POST(req: NextRequest) {
  return login(req);
}