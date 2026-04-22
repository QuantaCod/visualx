import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  useCreateArticle,
  useUpdateArticle,
  useListArticles,
  getListArticlesQueryKey,
  getGetArticleQueryKey,
} from "@workspace/api-client-react";
import { PageMeta } from "@/components/PageMeta";
import { RichHtml } from "@/components/RichHtml";

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string;
  tags: string;
  metaDescription: string;
}

const empty: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  contentHtml: "<p>Write your article content here…</p>",
  coverImage: "",
  tags: "",
  metaDescription: "",
};

export default function ArticleEditor() {
  const [matchEdit, params] = useRoute("/admin/articles/:id/edit");
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const isEdit = matchEdit && params?.id;
  const editId = isEdit ? Number(params.id) : null;

  const list = useListArticles();
  const createMut = useCreateArticle();
  const updateMut = useUpdateArticle();

  const [form, setForm] = useState<FormState>(empty);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit || !list.data || loaded) return;
    const found = list.data.find((a) => a.id === editId);
    if (!found) return;
    fetch(`/api/articles/${found.slug}`, { credentials: "include" })
      .then((r) => r.json())
      .then((a) => {
        setForm({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          contentHtml: a.contentHtml,
          coverImage: a.coverImage ?? "",
          tags: (a.tags ?? []).join(", "),
          metaDescription: a.metaDescription ?? "",
        });
        setLoaded(true);
      });
  }, [isEdit, editId, list.data, loaded]);

  const update = (k: keyof FormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitErr(null);
    setBusy(true);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      contentHtml: form.contentHtml,
      coverImage: form.coverImage.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      metaDescription: form.metaDescription,
    };
    try {
      if (isEdit && editId) {
        await updateMut.mutateAsync({ id: editId, data: payload });
        qc.invalidateQueries({ queryKey: getGetArticleQueryKey(payload.slug) });
      } else {
        await createMut.mutateAsync({ data: payload });
      }
      qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
      navigate("/admin/dashboard");
    } catch (err) {
      setSubmitErr((err as Error).message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && !loaded) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <>
      <PageMeta title={isEdit ? "Edit article" : "New article"} />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {isEdit ? "Edit article" : "New article"}
        </h1>

        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <Field label="Slug">
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className={inputCls}
                data-testid="input-article-slug"
              />
            </Field>
            <Field label="Title">
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={inputCls}
                data-testid="input-article-title"
              />
            </Field>
            <Field label="Excerpt">
              <textarea
                required
                rows={3}
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                className={inputCls}
                data-testid="input-article-excerpt"
              />
            </Field>
            <Field label="Cover image URL">
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
                className={inputCls}
                placeholder="https://..."
                data-testid="input-article-cover"
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className={inputCls}
                data-testid="input-article-tags"
              />
            </Field>
            <Field label="Meta description (SEO)">
              <input
                type="text"
                value={form.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                className={inputCls}
                data-testid="input-article-meta"
              />
            </Field>
          </div>

          <div className="space-y-5">
            <Field label="Content (HTML supported)">
              <textarea
                required
                rows={20}
                value={form.contentHtml}
                onChange={(e) => update("contentHtml", e.target.value)}
                className={`${inputCls} font-mono text-xs`}
                data-testid="input-article-content"
              />
            </Field>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                Live preview
              </div>
              <div className="rounded-lg border border-border bg-card p-4 max-h-72 overflow-auto">
                <RichHtml html={form.contentHtml} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-border">
            {submitErr && (
              <span className="text-sm text-destructive mr-auto">{submitErr}</span>
            )}
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-4 py-2 rounded-lg border border-border text-sm hover-elevate"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover-elevate disabled:opacity-60"
              data-testid="button-save-article"
            >
              {busy ? "Saving…" : isEdit ? "Save changes" : "Publish article"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
