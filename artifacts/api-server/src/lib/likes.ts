import { and, eq, inArray, sql } from "drizzle-orm";
import { db, likesTable } from "@workspace/db";

export async function getLikeCount(
  targetType: string,
  targetId: number,
): Promise<number> {
  const rows = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(likesTable)
    .where(
      and(eq(likesTable.targetType, targetType), eq(likesTable.targetId, targetId)),
    );
  return rows[0]?.c ?? 0;
}

export async function getLikeCounts(
  targetType: string,
  ids: number[],
): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({
      id: likesTable.targetId,
      c: sql<number>`count(*)::int`,
    })
    .from(likesTable)
    .where(
      and(
        eq(likesTable.targetType, targetType),
        inArray(likesTable.targetId, ids),
      ),
    )
    .groupBy(likesTable.targetId);
  for (const r of rows) map.set(r.id, r.c);
  for (const id of ids) if (!map.has(id)) map.set(id, 0);
  return map;
}

export async function hasLiked(
  targetType: string,
  targetId: number,
  fingerprint: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: likesTable.id })
    .from(likesTable)
    .where(
      and(
        eq(likesTable.targetType, targetType),
        eq(likesTable.targetId, targetId),
        eq(likesTable.fingerprint, fingerprint),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
