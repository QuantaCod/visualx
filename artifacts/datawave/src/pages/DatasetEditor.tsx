import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import { Upload, ArrowLeft } from "lucide-react";
import {
  useCreateDataset,
  useUpdateDataset,
  useListDatasets,
  getListDatasetsQueryKey,
  getGetDatasetQueryKey,
} from "@workspace/api-client-react";
import { ChartRenderer } from "@/components/ChartRenderer";
import { PageMeta } from "@/components/PageMeta";

interface FormState {
  slug: string;
  title: string;
  shortDescription: string;
  longDescriptionHtml: string;
  tags: string;
  data: string;
  metaDescription: string;
}

const empty: FormState = {
  slug: "",
  title: "",
  shortDescription: "",
  longDescriptionHtml: "",
  tags: "",
  data: '[\n  { "name": "Jan", "value": 12 },\n  { "name": "Feb", "value": 19 },\n  { "name": "Mar", "value": 7 }\n]',
  metaDescription: "",
};

export default function DatasetEditor() {
  const [matchEdit, params] = useRoute("/admin/datasets/:id/edit");
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const isEdit = matchEdit && params?.id;
  const editId = isEdit ? Number(params.id) : null;

  const list = useListDatasets();
  const createMut = useCreateDataset();
  const updateMut = useUpdateDataset();

  const [form, setForm] = useState<FormState>(empty);
  const [dataError, setDataError] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit || !list.data || loaded) return;
    const found = list.data.find((d) => d.id === editId);
    if (!found) return;
    fetch(`/api/datasets/${found.slug}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setForm({
          slug: d.slug,
          title: d.title,
          shortDescription: d.shortDescription,
          longDescriptionHtml: d.longDescriptionHtml ?? "",
          tags: (d.tags ?? []).join(", "),
          data: JSON.stringify(d.data ?? [], null, 2),
          metaDescription: d.metaDescription ?? "",
        });
        setLoaded(true);
      });
  }, [isEdit, editId, list.data, loaded]);

  const update = (k: keyof FormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  let parsedData: unknown = null;
  try {
    parsedData = JSON.parse(form.data);
  } catch {
    parsedData = null;
  }

  const onCsvUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          update("data", JSON.stringify(res.data, null, 2));
          setDataError(null);
        } catch (e) {
          setDataError("Could not parse CSV");
        }
      },
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitErr(null);
    let parsed: unknown[] = [];
    try {
      const v = JSON.parse(form.data);
      if (!Array.isArray(v)) throw new Error("data must be a JSON array");
      parsed = v;
      setDataError(null);
    } catch (err) {
      setDataError(String((err as Error).message));
      return;
    }
    setBusy(true);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      longDescriptionHtml: form.longDescriptionHtml,
      chartType: "bar",
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      data: parsed,
      metaDescription: form.metaDescription,
    };
    try {
      if (isEdit && editId) {
        await updateMut.mutateAsync({ id: editId, data: payload });
        qc.invalidateQueries({ queryKey: getGetDatasetQueryKey(payload.slug) });
      } else {
        await createMut.mutateAsync({ data: payload });
      }
      qc.invalidateQueries({ queryKey: getListDatasetsQueryKey() });
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
      <PageMeta title={isEdit ? "Edit dataset" : "New dataset"} />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {isEdit ? "Edit dataset" : "New dataset"}
        </h1>

        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <Field label="Slug (URL identifier)">
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className={inputCls}
                data-testid="input-dataset-slug"
              />
            </Field>
            <Field label="Title">
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={inputCls}
                data-testid="input-dataset-title"
              />
            </Field>
            <Field label="Short description (above chart)">
              <textarea
                required
                rows={2}
                value={form.shortDescription}
                onChange={(e) => update("shortDescription", e.target.value)}
                className={inputCls}
                data-testid="input-dataset-short"
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className={inputCls}
                placeholder="economy, climate"
                data-testid="input-dataset-tags"
              />
            </Field>
            <Field label="Long description (HTML supported, below chart)">
              <textarea
                rows={8}
                value={form.longDescriptionHtml}
                onChange={(e) => update("longDescriptionHtml", e.target.value)}
                className={`${inputCls} font-mono text-xs`}
                placeholder="<p>Detailed analysis...</p>"
                data-testid="input-dataset-long"
              />
            </Field>
            <Field label="Meta description (SEO)">
              <input
                type="text"
                value={form.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                className={inputCls}
                data-testid="input-dataset-meta"
              />
            </Field>
          </div>

          <div className="space-y-5">
            <Field
              label="Data (JSON array)"
              hint='Format: [{"name": "Jan", "value": 12}, ...]'
            >
              <div className="flex items-center gap-2 mb-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs cursor-pointer hover-elevate">
                  <Upload className="w-3.5 h-3.5" />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onCsvUpload(f);
                    }}
                    data-testid="input-dataset-csv"
                  />
                </label>
              </div>
              <textarea
                rows={14}
                value={form.data}
                onChange={(e) => update("data", e.target.value)}
                className={`${inputCls} font-mono text-xs`}
                data-testid="input-dataset-data"
              />
              {dataError && (
                <p className="text-xs text-destructive mt-1">{dataError}</p>
              )}
            </Field>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                Live preview
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <ChartRenderer type="bar" data={parsedData} height={260} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Visitors will be able to switch between bar, line, and pie views on the public dataset page.
              </p>
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
              data-testid="button-save-dataset"
            >
              {busy ? "Saving…" : isEdit ? "Save changes" : "Publish dataset"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1 font-mono">{hint}</p>}
    </div>
  );
}
