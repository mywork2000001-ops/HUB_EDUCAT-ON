import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  const topicId = Number(new URL(req.url).searchParams.get("topic_id"));
  if (!topicId) return NextResponse.json({ error: "topic_id tələb olunur" }, { status: 400 });
  const resources = await db.resource.findMany({
    where: { curriculum_id: topicId },
    orderBy: [{ type: "asc" }, { created_at: "asc" }],
  });
  return NextResponse.json({ resources });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id tələb olunur" }, { status: 400 });
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.title_az    !== undefined) data.title_az    = String(body.title_az).trim();
    if (body.title_ru    !== undefined) data.title_ru    = String(body.title_ru).trim();
    if (body.content_url !== undefined) data.content_url = body.content_url ? String(body.content_url).trim() : null;
    if (body.is_published !== undefined) data.is_published = Boolean(body.is_published);
    const resource = await db.resource.update({ where: { id }, data });
    return NextResponse.json({ resource });
  } catch {
    return NextResponse.json({ error: "Tapılmadı" }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  try {
    const { curriculum_id, type, title_az, title_ru, content_url } = await req.json();
    if (!curriculum_id || !type || !title_az)
      return NextResponse.json({ error: "Mövzu, növ və başlıq tələb olunur" }, { status: 400 });

    const slug =
      title_az
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 40) +
      "-" +
      Date.now();

    const resource = await db.resource.create({
      data: {
        curriculum_id: Number(curriculum_id),
        type,
        slug,
        title_az: String(title_az).trim(),
        title_ru: title_ru ? String(title_ru).trim() : String(title_az).trim(),
        content_url: content_url ? String(content_url).trim() : null,
        is_published: true,
      },
    });
    return NextResponse.json({ resource }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("P2003")) return NextResponse.json({ error: "Mövzu mövcud deyil" }, { status: 400 });
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id tələb olunur" }, { status: 400 });
  try {
    await db.resource.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Tapılmadı" }, { status: 404 });
  }
}
