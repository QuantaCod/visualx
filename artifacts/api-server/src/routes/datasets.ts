import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, datasetsTable } from "@workspace/db";
import { CreateDatasetBody, UpdateDatasetBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { getLikeCount, getLikeCounts } from "../lib/likes";

const router: IRouter = Router();

router.get("/datasets", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const tag = typeof req.query.tag === "string" ? req.query.tag.trim() : "";

  const filters = [];
  if (q) {
    filters.push(
      or(
        ilike(datasetsTable.title, `%${q}%`),
        ilike(datasetsTable.shortDescription, `%${q}%`),
      )!,
    );
  }
  if (tag) {
    filters.push(sql`${datasetsTable.tags} @> ${JSON.stringify([tag])}::jsonb`);
  }

  const rows = await db
    .select()
    .from(datasetsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(datasetsTable.createdAt));

  const likeMap = await getLikeCounts(
    "dataset",
    rows.map((r) => r.id),
  );

  res.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      shortDescription: r.shortDescription,
      chartType: r.chartType,
      tags: r.tags,
      likeCount: likeMap.get(r.id) ?? 0,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/datasets/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  const [row] = await db
    .select()
    .from(datasetsTable)
    .where(eq(datasetsTable.slug, slug))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const likeCount = await getLikeCount("dataset", row.id);
  res.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    longDescriptionHtml: row.longDescriptionHtml,
    chartType: row.chartType,
    tags: row.tags,
    data: row.data,
    metaDescription: row.metaDescription,
    likeCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.post("/datasets", requireAdmin, async (req, res) => {
  const parsed = CreateDatasetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  const [row] = await db
    .insert(datasetsTable)
    .values({
      slug: v.slug,
      title: v.title,
      shortDescription: v.shortDescription,
      longDescriptionHtml: v.longDescriptionHtml ?? "",
      chartType: v.chartType,
      tags: (v.tags ?? []) as string[],
      data: v.data ?? [],
      metaDescription: v.metaDescription ?? "",
      updatedAt: new Date(),
    })
    .returning();
  res.json({
    ...row,
    tags: row.tags,
    likeCount: 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.put("/datasets/id/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateDatasetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  const [row] = await db
    .update(datasetsTable)
    .set({
      slug: v.slug,
      title: v.title,
      shortDescription: v.shortDescription,
      longDescriptionHtml: v.longDescriptionHtml ?? "",
      chartType: v.chartType,
      tags: (v.tags ?? []) as string[],
      data: v.data ?? [],
      metaDescription: v.metaDescription ?? "",
      updatedAt: new Date(),
    })
    .where(eq(datasetsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const likeCount = await getLikeCount("dataset", row.id);
  res.json({
    ...row,
    tags: row.tags,
    likeCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.delete("/datasets/id/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(datasetsTable).where(eq(datasetsTable.id, id));
  res.json({ ok: true });
});

export default router;
