// Send email notification via Gmail SMTP (nodemailer)
// Requires env vars: GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_EMAIL
// If vars are absent, silently skips — notification is best-effort.

type ResultNotification = {
  student_name:  string;
  student_class: string;
  platform:      string;
  lesson_title:  string;
  score:         number;
  total:         number;
  percent:       number;
};

export async function sendResultNotification(r: ResultNotification): Promise<void> {
  const user    = process.env.GMAIL_USER;
  const pass    = process.env.GMAIL_APP_PASSWORD;
  const to      = process.env.NOTIFY_EMAIL ?? "mywork2000001@gmail.com";

  if (!user || !pass) return; // not configured — skip silently

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const pct  = r.percent;
    const icon = pct >= 70 ? "✅" : "❌";
    const subj = `${icon} Yeni nəticə — ${r.student_name} (${pct}%)`;

    const html = `
<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
  <h2 style="color:#1e293b;margin-bottom:4px">EduHub — Yeni Test Nəticəsi</h2>
  <p style="color:#64748b;font-size:14px;margin-top:0">Şagird testi tamamladı</p>
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:16px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#64748b;width:120px">Şagird:</td>
          <td style="padding:6px 0;font-weight:600;color:#0f172a">${r.student_name}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Sinif:</td>
          <td style="padding:6px 0;color:#0f172a">${r.student_class || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Platforma:</td>
          <td style="padding:6px 0;color:#0f172a">${r.platform}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Mövzu:</td>
          <td style="padding:6px 0;color:#0f172a">${r.lesson_title || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Nəticə:</td>
          <td style="padding:6px 0;font-weight:700;font-size:16px;color:${pct >= 70 ? "#16a34a" : "#dc2626"}">
            ${r.score}/${r.total} — ${pct}%
          </td>
      </tr>
    </table>
  </div>
  <p style="margin-top:16px;text-align:center">
    <a href="https://hub-educat-on.vercel.app/dashboard/results"
       style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
      Nəticələrə bax
    </a>
  </p>
  <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px">
    EduHub Tədris Platforması · hub-educat-on.vercel.app
  </p>
</div>`;

    await transporter.sendMail({
      from: `"EduHub" <${user}>`,
      to,
      subject: subj,
      html,
    });
  } catch {
    // Email failure must never break result saving — swallow error
  }
}
