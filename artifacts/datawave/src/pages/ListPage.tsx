import { useListDatasets, useListArticles } from "@workspace/api-client-react";
import { DatasetCard } from "@/components/DatasetCard";
import { ArticleCard } from "@/components/ArticleCard";
import { PageMeta } from "@/components/PageMeta";

export function DatasetsPage() {
  const { data, isLoading } = useListDatasets();
  return (
    <>
      <PageMeta title="All datasets" description="All published datasets on DataWave." />
      <section className="mx-auto max-w-[1400px] px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">All datasets</h1>
        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No datasets yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data!.map((d) => <DatasetCard key={d.id} item={d} />)}
          </div>
        )}
      </section>
    </>
  );
}

export function ArticlesPage() {
  const { data, isLoading } = useListArticles();
  return (
    <>
      <PageMeta title="All articles" description="All published articles on DataWave." />
      <section className="mx-auto max-w-[1400px] px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">All articles</h1>
        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No articles yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data!.map((a) => <ArticleCard key={a.id} item={a} />)}
          </div>
        )}
      </section>
    </>
  );
}
