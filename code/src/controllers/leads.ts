import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { listLeads, getLead, createLead, updateLead, deleteLead } from "@/services/leads";

export async function list(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await listLeads();
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { name, email, phone, status, notes } = body as {
    name?: string;
    email?: string | null;
    phone?: string | null;
    status?: "NEW" | "QUALIFIED" | "WON" | "LOST";
    notes?: string | null;
  };

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const id = await createLead({ name, email, phone, status, notes });
  return NextResponse.json({ id });
}

export async function getOne(req: NextRequest, id: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await getLead(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function update(req: NextRequest, id: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const affected = await updateLead(id, body);
  if (!affected) return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function remove(req: NextRequest, id: number) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const affected = await deleteLead(id);
  if (!affected) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}