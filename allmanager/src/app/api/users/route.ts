import { NextRequest } from "next/server";
import { createUserByAdmin } from "@/controllers/auth";
import { list } from "@/controllers/users";

export async function GET(req: NextRequest) {
  return list(req);
}

export async function POST(req: NextRequest) {
  return createUserByAdmin(req);
}
