import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function BreadcrumbNav({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-slate-300 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-200 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
