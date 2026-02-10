import { NextRequest } from "next/server";
import { create } from "@/controllers/tasks";

export async function POST(req: NextRequest) {
  return create(req);
}
