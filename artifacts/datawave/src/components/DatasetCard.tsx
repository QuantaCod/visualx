import { Link } from "wouter";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import { TagChip } from "./TagChip";
import { LikeButton } from "./LikeButton";
import type { DatasetSummary } from "@workspace/api-client-react";

type Item = DatasetSummary;

const ICONS: Record<string, typeof BarChart3> = {
  bar: BarChart3,
  line: LineIcon,
  pie: PieIcon,
};

export function DatasetCard({ item }: { item: Item }) {
  const Icon = ICONS[item.chartType] ?? BarChart3;
  return (
    <article
      className="group relative rounded-xl border border-border bg-card p-5 hover-elevate transition-all"
      data-testid={`card-dataset-${item.slug}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1 rounded-full border border-border">
          {item.chartType}
        </span>
      </div>
      <Link href={`/dataset/${item.slug}`} className="block">
        <h3 className="text-lg font-semibold leading-tight mb-1.5 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {item.shortDescription}
        </p>
      </Link>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {item.tags.slice(0, 4).map((t: string) => (
          <TagChip key={t} tag={t} />
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
        <LikeButton
          targetType="dataset"
          targetId={item.id}
          slug={item.slug}
          initialCount={item.likeCount}
        />
      </div>
    </article>
  );
}
