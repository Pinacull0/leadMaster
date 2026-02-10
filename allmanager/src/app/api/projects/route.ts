import { NextRequest } from "next/server";
import { list, create } from "@/controllers/projects";

export async function GET(req: NextRequest) {
  return list(req);
}

export async function POST(req: NextRequest) {
  return create(req);
}