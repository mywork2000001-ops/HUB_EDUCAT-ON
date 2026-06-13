import type { ResourceRow } from "@/server/queries/resources";
import { ResourceCard } from "./ResourceCard";
import { RESOURCE_TYPE_LABELS } from "@/lib/constants";
import type { Lang } from "@/lib/constants";
import type { ResourceType } from "@/generated/prisma/client";

interface Props {
  resources: ResourceRow[];
  basePath: string;
  lang?: Lang;
}

function groupByType(resources: ResourceRow[]) {
  return resources.reduce<Partial<Record<ResourceType, ResourceRow[]>>>(
    (acc, r) => {
      (acc[r.type] ??= []).push(r);
      return acc;
    },
    {},
  );
}

export function ResourceGrid({ resources, basePath, lang = "az" }: Props) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-sm">
          {lang === "az" ? "Resurs tapılmadı" : "Ресурсы не найдены"}
        </p>
      </div>
    );
  }

  const grouped = groupByType(resources);

  return (
    <div className="space-y-8">
      {(Object.entries(grouped) as [ResourceType, ResourceRow[]][]).map(([type, items]) => (
        <section key={type}>
          <h2 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {RESOURCE_TYPE_LABELS[type][lang]}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                href={`${basePath}/${resource.slug}`}
                lang={lang}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
