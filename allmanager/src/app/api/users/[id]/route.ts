import { NextRequest } from "next/server";
import { update, remove } from "@/controllers/users";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return update(req, Number(id));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return remove(req, Number(id));
}
