import { NextRequest } from "next/server";
import { listByProject } from "@/controllers/tasks";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return listByProject(req, Number(id));
}
