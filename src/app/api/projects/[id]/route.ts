import { NextRequest, NextResponse } from "next/server";
import { getOne, update, remove } from "@/controllers/projects";
import { parsePositiveIntId } from "@/utils/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parsePositiveIntId(id);
  if (!parsedId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  return getOne(req, parsedId);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parsePositiveIntId(id);
  if (!parsedId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  return update(req, parsedId);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parsePositiveIntId(id);
  if (!parsedId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  return remove(req, parsedId);
}
