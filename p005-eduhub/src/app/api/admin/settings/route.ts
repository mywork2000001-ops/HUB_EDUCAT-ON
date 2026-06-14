import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTeacher } from "@/lib/verify-teacher";

// GET /api/admin/settings — return current teacher profile
export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  const token = req.cookies.get("eduhub-token")?.value ?? "";
  const { data } = await supabaseAdmin.auth.getUser(token);
  const user = data.user;
  return NextResponse.json({
    email:      user?.email ?? "",
    name:       user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Müəllim",
    created_at: user?.created_at ?? null,
  });
}

// PATCH /api/admin/settings — change teacher's own password
export async function PATCH(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });

  try {
    const { new_password, current_password } = await req.json();

    if (!new_password || !current_password)
      return NextResponse.json({ error: "Cari və yeni şifrə tələb olunur" }, { status: 400 });
    if (String(new_password).length < 8)
      return NextResponse.json({ error: "Yeni şifrə minimum 8 simvol olmalıdır" }, { status: 400 });

    // Verify current password by re-authenticating
    const token = req.cookies.get("eduhub-token")?.value ?? "";
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (!userData.user?.email)
      return NextResponse.json({ error: "İstifadəçi tapılmadı" }, { status: 401 });

    // Import supabaseAuth for re-auth
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const authClient = createClient(url, anonKey);

    const { error: signInError } = await authClient.auth.signInWithPassword({
      email: userData.user.email,
      password: current_password,
    });
    if (signInError)
      return NextResponse.json({ error: "Cari şifrə yanlışdır" }, { status: 401 });

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      { password: new_password }
    );
    if (updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
