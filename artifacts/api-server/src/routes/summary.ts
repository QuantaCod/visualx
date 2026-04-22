import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, datasetsTable, articlesTable, likesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/summary", async (_req, res) => {
  const [[d], [a], [l]] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(datasetsTable),
    db.select({ c: sql<number>`count(*)::int` }).from(articlesTable),
    db.select({ c: sql<number>`count(*)::int` }).from(likesTable),
  ]);

  const tagRows = await db.execute<{ tag: string; count: number }>(sql`
    SELECT tag, COUNT(*)::int AS count FROM (
      SELECT jsonb_array_elements_text(tags) AS tag FROM datasets
      UNION ALL
      SELECT jsonb_array_elements_text(tags) AS tag FROM articles
    ) t
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 10
  `);

  res.json({
    totalDatasets: d.c,
    totalArticles: a.c,
    totalLikes: l.c,
    topTags: (tagRows.rows ?? []).map((r) => ({ tag: r.tag, count: r.count })),
  });
});

router.get("/tags", async (_req, res) => {
  const rows = await db.execute<{ tag: string; count: number }>(sql`
    SELECT tag, COUNT(*)::int AS count FROM (
      SELECT jsonb_array_elements_text(tags) AS tag FROM datasets
      UNION ALL
      SELECT jsonb_array_elements_text(tags) AS tag FROM articles
    ) t
    GROUP BY tag
    ORDER BY count DESC
  `);
  res.json((rows.rows ?? []).map((r) => ({ tag: r.tag, count: r.count })));
});

export default router;
