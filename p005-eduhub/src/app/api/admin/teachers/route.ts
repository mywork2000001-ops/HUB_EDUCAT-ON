import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const teachers = data.users.map((u) => ({
      id:         u.id,
      email:      u.email ?? "",
      name:       (u.user_metadata?.full_name as string) ?? "",
      role:       (u.user_metadata?.role as string) ?? "teacher",
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
      confirmed:  !!u.email_confirmed_at,
    }));

    return NextResponse.json({ teachers });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });

  try {
    const { email, password, name, role = "teacher" } = await req.json();
    const validRole = ["main_teacher", "teacher"].includes(role) ? role : "teacher";

    if (!email || !password)
      return NextResponse.json({ error: "E-poçt və şifrə tələb olunur" }, { status: 400 });
    if (String(password).length < 8)
      return NextResponse.json({ error: "Şifrə minimum 8 simvol olmalıdır" }, { status: 400 });

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name ?? "", role: validRole },
    });

    if (error) {
      if (error.message.includes("already"))
        return NextResponse.json({ error: "Bu e-poçt artıq mövcuddur" }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ teacher: { id: data.user.id, email: data.user.email } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

  try {
    const { role } = await req.json();
    if (!["main_teacher", "teacher"].includes(role))
      return NextResponse.json({ error: "Yanlış rol" }, { status: 400 });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: { role },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
