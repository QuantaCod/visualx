import { useState } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, BarChart3, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import { useGetDataset } from "@workspace/api-client-react";
import { PageMeta } from "@/components/PageMeta";
import { ChartRenderer } from "@/components/ChartRenderer";
import { RichHtml } from "@/components/RichHtml";
import { TagChip } from "@/components/TagChip";
import { LikeButton } from "@/components/LikeButton";
import NotFound from "./not-found";

const CHART_TYPES = [
  { id: "bar", label: "Bar", Icon: BarChart3 },
  { id: "line", label: "Line", Icon: LineIcon },
  { id: "pie", label: "Pie", Icon: PieIcon },
] as const;

export default function DatasetDetail() {
  const [, params] = useRoute("/dataset/:slug");
  const slug = params?.slug ?? "";
  const { data, isLoading, error } = useGetDataset(slug);
  const [chart, setChart] = useState<"bar" | "line" | "pie">("bar");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-16 text-muted-foreground">
        Loading dataset…
      </div>
    );
  }
  if (error || !data) return <NotFound />;

  return (
    <>
      <PageMeta
        title={data.title}
        description={data.metaDescription || data.shortDescription}
      />
      <article className="mx-auto max-w-[1100px] px-6 py-12">
        <Link
          href="/datasets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back-datasets"
        >
          <ArrowLeft className="w-4 h-4" /> Back to datasets
        </Link>
        <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
            dataset
          </span>
          <span>·</span>
          <span>{new Date(data.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-dataset-title">
          {data.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          {data.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {data.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:p-6 mb-8">
          <div className="flex items-center justify-end gap-1 mb-4">
            {CHART_TYPES.map(({ id, label, Icon }) => {
              const active = chart === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChart(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    active
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-chart-${id}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              );
            })}
          </div>
          <ChartRenderer type={chart} data={data.data} height={420} />
        </div>

        <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
          <span className="text-sm text-muted-foreground">
            Found this useful?
          </span>
          <LikeButton
            targetType="dataset"
            targetId={data.id}
            slug={data.slug}
            initialCount={data.likeCount}
          />
        </div>

        {data.longDescriptionHtml && (
          <RichHtml html={data.longDescriptionHtml} />
        )}
      </article>
    </>
  );
}
