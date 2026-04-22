import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, likesTable } from "@workspace/db";
import { ToggleLikeBody, GetLikeStatusQueryParams } from "@workspace/api-zod";
import { getLikeCount, hasLiked } from "../lib/likes";

const router: IRouter = Router();

const RATE_LIMIT_MS = 1500;
const recentToggles = new Map<string, number>();

router.post("/likes", async (req, res) => {
  const parsed = ToggleLikeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { targetType, targetId, fingerprint } = parsed.data;
  if (targetType !== "dataset" && targetType !== "article") {
    res.status(400).json({ error: "Invalid targetType" });
    return;
  }
  const fp = fingerprint.slice(0, 200);
  const key = `${targetType}:${targetId}:${fp}`;
  const now = Date.now();
  const last = recentToggles.get(key) ?? 0;
  if (now - last < RATE_LIMIT_MS) {
    const liked = await hasLiked(targetType, targetId, fp);
    const likeCount = await getLikeCount(targetType, targetId);
    res.json({ liked, likeCount });
    return;
  }
  recentToggles.set(key, now);
  if (recentToggles.size > 5000) {
    for (const [k, t] of recentToggles) {
      if (now - t > 60_000) recentToggles.delete(k);
    }
  }

  const existing = await db
    .select({ id: likesTable.id })
    .from(likesTable)
    .where(
      and(
        eq(likesTable.targetType, targetType),
        eq(likesTable.targetId, targetId),
        eq(likesTable.fingerprint, fp),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(likesTable).where(eq(likesTable.id, existing[0].id));
    const likeCount = await getLikeCount(targetType, targetId);
    res.json({ liked: false, likeCount });
    return;
  }

  await db
    .insert(likesTable)
    .values({ targetType, targetId, fingerprint: fp })
    .onConflictDoNothing();
  const likeCount = await getLikeCount(targetType, targetId);
  res.json({ liked: true, likeCount });
});

router.get("/likes/status", async (req, res) => {
  const parsed = GetLikeStatusQueryParams.safeParse({
    targetType: req.query.targetType,
    targetId: req.query.targetId,
    fingerprint: req.query.fingerprint,
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { targetType, targetId, fingerprint } = parsed.data as {
    targetType: string;
    targetId: number;
    fingerprint: string;
  };
  const liked = await hasLiked(targetType, targetId, fingerprint);
  const likeCount = await getLikeCount(targetType, targetId);
  res.json({ liked, likeCount });
});

export default router;
