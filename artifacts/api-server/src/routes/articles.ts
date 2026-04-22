import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, articlesTable } from "@workspace/db";
import { CreateArticleBody, UpdateArticleBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { getLikeCount, getLikeCounts } from "../lib/likes";

const router: IRouter = Router();

router.get("/articles", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const tag = typeof req.query.tag === "string" ? req.query.tag.trim() : "";

  const filters = [];
  if (q) {
    filters.push(
      or(
        ilike(articlesTable.title, `%${q}%`),
        ilike(articlesTable.excerpt, `%${q}%`),
      )!,
    );
  }
  if (tag) {
    filters.push(sql`${articlesTable.tags} @> ${JSON.stringify([tag])}::jsonb`);
  }

  const rows = await db
    .select()
    .from(articlesTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(articlesTable.createdAt));

  const likeMap = await getLikeCounts(
    "article",
    rows.map((r) => r.id),
  );

  res.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      coverImage: r.coverImage,
      tags: r.tags,
      likeCount: likeMap.get(r.id) ?? 0,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/articles/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  const [row] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, slug))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const likeCount = await getLikeCount("article", row.id);
  res.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentHtml: row.contentHtml,
    coverImage: row.coverImage,
    tags: row.tags,
    metaDescription: row.metaDescription,
    likeCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.post("/articles", requireAdmin, async (req, res) => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  const [row] = await db
    .insert(articlesTable)
    .values({
      slug: v.slug,
      title: v.title,
      excerpt: v.excerpt,
      contentHtml: v.contentHtml,
      coverImage: v.coverImage ?? "",
      tags: (v.tags ?? []) as string[],
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

router.put("/articles/id/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  const [row] = await db
    .update(articlesTable)
    .set({
      slug: v.slug,
      title: v.title,
      excerpt: v.excerpt,
      contentHtml: v.contentHtml,
      coverImage: v.coverImage ?? "",
      tags: (v.tags ?? []) as string[],
      metaDescription: v.metaDescription ?? "",
      updatedAt: new Date(),
    })
    .where(eq(articlesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const likeCount = await getLikeCount("article", row.id);
  res.json({
    ...row,
    tags: row.tags,
    likeCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.delete("/articles/id/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(articlesTable).where(eq(articlesTable.id, id));
  res.json({ ok: true });
});

export default router;
