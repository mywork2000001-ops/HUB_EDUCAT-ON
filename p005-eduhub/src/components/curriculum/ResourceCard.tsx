import Link from "next/link";
import type { ResourceRow } from "@/server/queries/resources";
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLOR } from "@/lib/constants";
import type { Lang } from "@/lib/constants";

interface Props {
  resource: ResourceRow;
  href: string;
  lang?: Lang;
}

export function ResourceCard({ resource, href, lang = "az" }: Props) {
  const title     = lang === "az" ? resource.title_az : resource.title_ru;
  const typeLabel = RESOURCE_TYPE_LABELS[resource.type][lang];
  const typeColor = RESOURCE_TYPE_COLOR[resource.type];
  const meta      = resource.metadata as Record<string, unknown> | null;

  return (
    <Link
      href={href}
      className="group block rounded-xl bg-slate-900 border border-slate-800 p-4
                 hover:border-slate-600 hover:bg-slate-800 transition-all"
    >
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                    border ${typeColor}`}
      >
        {typeLabel}
      </span>

      <h3 className="mt-3 text-sm font-semibold text-slate-100 group-hover:text-white leading-snug">
        {title}
      </h3>

      {meta && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
          {typeof meta.questions_count === "number" && (
            <span>{meta.questions_count} sual</span>
          )}
          {typeof meta.duration_min === "number" && (
            <span>{meta.duration_min} dəq</span>
          )}
          {typeof meta.difficulty === "string" && (
            <span className="capitalize">{meta.difficulty}</span>
          )}
        </div>
      )}
    </Link>
  );
}
