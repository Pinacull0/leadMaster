import { NextRequest, NextResponse } from "next/server";
import { listByProject } from "@/controllers/tasks";
import { parsePositiveIntId } from "@/utils/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parsePositiveIntId(id);
  if (!parsedId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  return listByProject(req, parsedId);
}
