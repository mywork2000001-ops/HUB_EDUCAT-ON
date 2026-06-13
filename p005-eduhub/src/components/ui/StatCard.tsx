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

const COLORS: Record<Color, { iconBg: string; iconText: string; val: string }> = {
  indigo:  { iconBg: "bg-indigo-100",  iconText: "text-indigo-600",  val: "text-indigo-600"  },
  blue:    { iconBg: "bg-blue-100",    iconText: "text-blue-600",    val: "text-blue-600"    },
  violet:  { iconBg: "bg-violet-100",  iconText: "text-violet-600",  val: "text-violet-600"  },
  emerald: { iconBg: "bg-emerald-100", iconText: "text-emerald-600", val: "text-emerald-600" },
  amber:   { iconBg: "bg-amber-100",   iconText: "text-amber-600",   val: "text-amber-600"   },
  rose:    { iconBg: "bg-rose-100",    iconText: "text-rose-600",    val: "text-rose-600"    },
};

export function StatCard({ label, value, icon, sub, href, color = "indigo", trend }: Props) {
  const c = COLORS[color];

  const inner = (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 p-5 transition-all group shadow-sm",
      href && "hover:shadow-md hover:border-slate-300 cursor-pointer",
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0", c.iconBg, c.iconText)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend.value >= 0
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200",
          )}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}{trend.label}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className={cn("text-2xl font-bold tracking-tight", c.val)}>{value}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
