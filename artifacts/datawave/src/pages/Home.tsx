import { useMemo, useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Search, Tag } from "lucide-react";
import {
  useListDatasets,
  useListArticles,
  useListTags,
} from "@workspace/api-client-react";
import { PageMeta } from "@/components/PageMeta";
import { DatasetCard } from "@/components/DatasetCard";
import { ArticleCard } from "@/components/ArticleCard";
import { TagChip } from "@/components/TagChip";

export default function Home() {
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const initialTag = params.get("tag") ?? "";
  const [tag, setTag] = useState<string>(initialTag);
  const [q, setQ] = useState<string>("");

  useEffect(() => {
    setTag(initialTag);
  }, [initialTag]);

  const tags = useListTags();
  const queryArgs = { ...(q ? { q } : {}), ...(tag ? { tag } : {}) };
  const datasets = useListDatasets(queryArgs);
  const articles = useListArticles(queryArgs);

  return (
    <>
      <PageMeta
        title="DataWave — Open data, visualized"
        description="Browse interactive datasets and editorial articles. No accounts required, just pure data exploration."
      />
      <section className="mx-auto max-w-[1400px] px-6 pt-16 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            LIVE — public data terminal
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">
            Open data,
            <br />
            <span className="text-primary">visualized in real time.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Browse curated datasets with interactive charts and read in-depth analysis. Like what resonates — no account needed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6">
        <div className="rounded-xl border border-border bg-card/40 p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search datasets and articles..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              data-testid="input-search"
            />
          </div>
          {tag && (
            <button
              type="button"
              onClick={() => setTag("")}
              className="text-xs text-muted-foreground hover:text-foreground"
              data-testid="button-clear-tag"
            >
              Clear filter: #{tag} ×
            </button>
          )}
        </div>

        {tags.data && tags.data.length > 0 && (
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            {tags.data.slice(0, 12).map((t) => (
              <TagChip
                key={t.tag}
                tag={t.tag}
                active={t.tag === tag}
                asLink={false}
                onClick={() => setTag(t.tag === tag ? "" : t.tag)}
              />
            ))}
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-2xl font-bold tracking-tight">
              Datasets
              <span className="ml-3 text-sm text-muted-foreground font-normal font-mono">
                {datasets.data?.length ?? 0}
              </span>
            </h2>
          </div>
          {datasets.isLoading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : (datasets.data?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No datasets yet. The admin can publish the first one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.data!.map((d) => (
                <DatasetCard key={d.id} item={d} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-2xl font-bold tracking-tight">
              Articles
              <span className="ml-3 text-sm text-muted-foreground font-normal font-mono">
                {articles.data?.length ?? 0}
              </span>
            </h2>
          </div>
          {articles.isLoading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : (articles.data?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No articles published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.data!.map((a) => (
                <ArticleCard key={a.id} item={a} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
