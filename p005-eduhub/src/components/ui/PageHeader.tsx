import Link from "next/link";
import { cn } from "@/lib/utils";

interface Crumb { label: string; href?: string }

interface Props {
  title:       string;
  description?: string;
  crumbs?:     Crumb[];
  action?:     { label: string; href: string; icon?: string };
  className?:  string;
}

export function PageHeader({ title, description, crumbs, action, className }: Props) {
  return (
    <div className={cn("mb-7", className)}>
      {crumbs && crumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-700">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-slate-400 transition-colors">{c.label}</Link>
              ) : (
                <span className="text-slate-500">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg
                       bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
                       transition-colors shadow-lg shadow-indigo-900/30"
          >
            {action.icon && <span>{action.icon}</span>}
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
