import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

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
