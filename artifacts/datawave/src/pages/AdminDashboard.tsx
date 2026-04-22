import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, LogOut, Pencil, Trash2, Database, FileText, Heart } from "lucide-react";
import {
  useGetSummary,
  useListDatasets,
  useListArticles,
  useDeleteDataset,
  useDeleteArticle,
  getListDatasetsQueryKey,
  getListArticlesQueryKey,
} from "@workspace/api-client-react";
import { adminLogout } from "@/lib/admin";
import { PageMeta } from "@/components/PageMeta";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const datasets = useListDatasets();
  const articles = useListArticles();
  const summary = useGetSummary();
  const delDataset = useDeleteDataset();
  const delArticle = useDeleteArticle();

  const stats = [
    { label: "Datasets", value: summary.data?.totalDatasets ?? 0, icon: Database },
    { label: "Articles", value: summary.data?.totalArticles ?? 0, icon: FileText },
    { label: "Likes", value: summary.data?.totalLikes ?? 0, icon: Heart },
  ];

  const onLogout = async () => {
    await adminLogout();
    await qc.invalidateQueries({ queryKey: ["admin-me"] });
    navigate("/admin");
  };

  const onDeleteDataset = async (id: number) => {
    if (!confirm("Delete this dataset?")) return;
    await delDataset.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListDatasetsQueryKey() });
  };
  const onDeleteArticle = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    await delArticle.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
  };

  return (
    <>
      <PageMeta title="Admin dashboard" />
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage datasets and articles.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover-elevate"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5"
              data-testid={`stat-${s.label.toLowerCase()}`}
            >
              <s.icon className="w-4 h-4 text-primary mb-2" strokeWidth={2.5} />
              <div className="text-3xl font-bold tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <Section
          title="Datasets"
          newHref="/admin/datasets/new"
          newTestId="button-new-dataset"
        >
          {datasets.isLoading ? (
            <Loading />
          ) : (datasets.data?.length ?? 0) === 0 ? (
            <Empty label="No datasets yet." />
          ) : (
            <Table
              rows={datasets.data!.map((d) => ({
                id: d.id,
                title: d.title,
                slug: d.slug,
                meta: `${d.chartType} · ${d.likeCount} likes`,
                editHref: `/admin/datasets/${d.id}/edit`,
                onDelete: () => onDeleteDataset(d.id),
                testidPrefix: "dataset",
              }))}
            />
          )}
        </Section>

        <div className="h-10" />

        <Section
          title="Articles"
          newHref="/admin/articles/new"
          newTestId="button-new-article"
        >
          {articles.isLoading ? (
            <Loading />
          ) : (articles.data?.length ?? 0) === 0 ? (
            <Empty label="No articles yet." />
          ) : (
            <Table
              rows={articles.data!.map((a) => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                meta: `${a.likeCount} likes`,
                editHref: `/admin/articles/${a.id}/edit`,
                onDelete: () => onDeleteArticle(a.id),
                testidPrefix: "article",
              }))}
            />
          )}
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  newHref,
  newTestId,
  children,
}: {
  title: string;
  newHref: string;
  newTestId: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link
          href={newHref}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover-elevate"
          data-testid={newTestId}
        >
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>
      {children}
    </section>
  );
}

function Loading() {
  return <div className="text-muted-foreground text-sm">Loading…</div>;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
      {label}
    </div>
  );
}

function Table({
  rows,
}: {
  rows: {
    id: number;
    title: string;
    slug: string;
    meta: string;
    editHref: string;
    onDelete: () => void;
    testidPrefix: string;
  }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
      {rows.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between p-4 hover-elevate"
          data-testid={`row-${r.testidPrefix}-${r.id}`}
        >
          <div className="min-w-0">
            <div className="font-medium truncate">{r.title}</div>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              /{r.slug} · {r.meta}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={r.editHref}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-sm hover-elevate"
              data-testid={`button-edit-${r.testidPrefix}-${r.id}`}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
            <button
              onClick={r.onDelete}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-destructive hover-elevate text-sm"
              data-testid={`button-delete-${r.testidPrefix}-${r.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
