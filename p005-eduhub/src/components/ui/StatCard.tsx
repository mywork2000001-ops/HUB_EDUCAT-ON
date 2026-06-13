import Link from "next/link";
import { cn } from "@/lib/utils";

type Color = "indigo" | "blue" | "violet" | "emerald" | "amber" | "rose";

interface Props {
  label:    string;
  value:    string | number;
  icon:     string;
  sub?:     string;
  href?:    string;
  color?:   Color;
  trend?:   { value: number; label: string };
}

const COLORS: Record<Color, { card: string; icon: string; text: string }> = {
  indigo:  { card: "border-indigo-800/40",  icon: "bg-indigo-950/80 text-indigo-400",  text: "text-indigo-400"  },
  blue:    { card: "border-blue-800/40",    icon: "bg-blue-950/80 text-blue-400",      text: "text-blue-400"    },
  violet:  { card: "border-violet-800/40",  icon: "bg-violet-950/80 text-violet-400",  text: "text-violet-400"  },
  emerald: { card: "border-emerald-800/40", icon: "bg-emerald-950/80 text-emerald-400",text: "text-emerald-400" },
  amber:   { card: "border-amber-800/40",   icon: "bg-amber-950/80 text-amber-400",    text: "text-amber-400"   },
  rose:    { card: "border-rose-800/40",    icon: "bg-rose-950/80 text-rose-400",      text: "text-rose-400"    },
};

export function StatCard({ label, value, icon, sub, href, color = "indigo", trend }: Props) {
  const c = COLORS[color];

  const inner = (
    <div className={cn(
      "bg-slate-900 rounded-xl border p-5 transition-all group",
      c.card,
      href && "hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 cursor-pointer",
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0", c.icon)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend.value >= 0
              ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40"
              : "bg-rose-950/50 text-rose-400 border border-rose-800/40",
          )}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}{trend.label}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm font-medium text-slate-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
