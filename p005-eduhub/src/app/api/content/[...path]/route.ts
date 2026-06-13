import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const PROJECTS_ROOT = path.resolve(process.cwd(), "..");
// On Vercel: set CONTENT_BASE_URL to your GitHub Pages / CDN URL
// e.g. https://feridhesenov.github.io/eduhub-content
const CONTENT_BASE_URL = process.env.CONTENT_BASE_URL?.replace(/\/$/, "");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".json": "application/json",
  ".woff2":"font/woff2",
};

// Injected into P004 HTML via proxy — syncs taim_history to /api/results
const P004_SYNC = `<script>(function(){
  var API='/api/results',SK='taim_hub_sent';
  function hist(){try{return JSON.parse(localStorage.getItem('taim_history')||'[]');}catch(e){return[];}}
  function sync(){
    var h=hist(),sent=parseInt(localStorage.getItem(SK)||'0',10);
    if(h.length<=sent)return;
    h.slice(sent).forEach(function(it){
      fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          student_name:it.name||'Müəllim',
          student_class:'',
          platform:'P004',
          lesson_id:it.topic||'',
          lesson_title:it.topic||'',
          score:Number(it.correct)||0,
          total:Number(it.total)||0,
          percent:Number(it.pct)||0,
          answers:{},
          started_at:null,
          finished_at:it.date?new Date(it.date).toISOString():new Date().toISOString()
        })
      }).catch(function(){});
    });
    localStorage.setItem(SK,String(h.length));
  }
  window.addEventListener('load',sync);
  setInterval(sync,4000);
})();</script>`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Production: redirect to CDN / GitHub Pages
  if (CONTENT_BASE_URL) {
    return NextResponse.redirect(`${CONTENT_BASE_URL}/${segments.join("/")}`, { status: 302 });
  }

  const filePath = path.resolve(PROJECTS_ROOT, ...segments);

  if (!filePath.startsWith(PROJECTS_ROOT)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // For P004 HTML files — inject sync script before </body>
    const isP004Html = segments[0] === "P004_TAIM_2026" && ext === ".html";
    if (isP004Html) {
      const html = content.toString("utf-8");
      const injected = html.includes("</body>")
        ? html.replace("</body>", P004_SYNC + "</body>")
        : html + P004_SYNC;
      return new NextResponse(injected, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
