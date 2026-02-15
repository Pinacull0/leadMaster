import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { listLeads, getLead, createLead, updateLead, deleteLead } from "@/services/leads";
import { validateJsonRequest } from "@/utils/security";
import {
  normalizeEmail,
  normalizeLeadStatus,
  normalizeOptionalText,
  normalizeText,
} from "@/utils/validation";

export async function list(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const data = await listLeads();
  return NextResponse.json(data);
}

export async function create(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;

  const name = normalizeText(body.name, 160);
  const email = body.email === undefined ? undefined : normalizeEmail(body.email);
  const phone = body.phone === undefined ? undefined : normalizeOptionalText(body.phone, 40);
  const status =
    body.status === undefined ? undefined : (normalizeLeadStatus(body.status) ?? undefined);
  const notes = body.notes === undefined ? undefined : normalizeOptionalText(body.notes, 4000);

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (body.email !== undefined && body.email !== null && !email) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (body.status !== undefined && !status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

  const invalidJson = validateJsonRequest(req);
  if (invalidJson) return invalidJson;
  const body = (await req.json()) as Record<string, unknown>;
  const input: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    status?: "NEW" | "QUALIFIED" | "WON" | "LOST";
    notes?: string | null;
  } = {};

  if (body.name !== undefined) {
    const name = normalizeText(body.name, 160);
    if (!name) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    input.name = name;
  }
  if (body.email !== undefined) {
    if (body.email === null || body.email === "") {
      input.email = null;
    } else {
      const email = normalizeEmail(body.email);
      if (!email) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      input.email = email;
    }
  }
  if (body.phone !== undefined) {
    if (body.phone === null || body.phone === "") {
      input.phone = null;
    } else {
      const phone = normalizeOptionalText(body.phone, 40);
      if (!phone) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
      input.phone = phone;
    }
  }
  if (body.status !== undefined) {
    const status = normalizeLeadStatus(body.status);
    if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    input.status = status;
  }
  if (body.notes !== undefined) {
    if (body.notes === null || body.notes === "") {
      input.notes = null;
    } else {
      const notes = normalizeOptionalText(body.notes, 4000);
      if (!notes) return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
      input.notes = notes;
    }
  }

  const affected = await updateLead(id, input);
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
