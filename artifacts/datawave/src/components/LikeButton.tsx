import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLikeStatus,
  useToggleLike,
  getGetLikeStatusQueryKey,
  getListDatasetsQueryKey,
  getListArticlesQueryKey,
  getGetDatasetQueryKey,
  getGetArticleQueryKey,
  getGetSummaryQueryKey,
} from "@workspace/api-client-react";
import { getFingerprint } from "@/lib/fingerprint";

interface Props {
  targetType: "dataset" | "article";
  targetId: number;
  slug?: string;
  initialCount?: number;
}

export function LikeButton({ targetType, targetId, slug, initialCount }: Props) {
  const fingerprint = getFingerprint();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const params = { targetType, targetId, fingerprint };

  const { data } = useGetLikeStatus(params, {
    query: { queryKey: getGetLikeStatusQueryKey(params) },
  });

  const liked = data?.liked ?? false;
  const count = data?.likeCount ?? initialCount ?? 0;

  const toggle = useToggleLike();

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await toggle.mutateAsync({ data: params });
      qc.setQueryData(getGetLikeStatusQueryKey(params), res);
      qc.invalidateQueries({
        queryKey:
          targetType === "dataset"
            ? getListDatasetsQueryKey()
            : getListArticlesQueryKey(),
      });
      if (slug) {
        qc.invalidateQueries({
          queryKey:
            targetType === "dataset"
              ? getGetDatasetQueryKey(slug)
              : getGetArticleQueryKey(slug),
        });
      }
      qc.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    } finally {
      setTimeout(() => setBusy(false), 1500);
    }
  };

  useEffect(() => {
    // initial bootstrap to avoid stale render flash
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      data-testid={`button-like-${targetType}-${targetId}`}
      className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
        liked
          ? "bg-primary/15 border-primary/50 text-primary"
          : "bg-card/60 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
      } ${busy ? "opacity-70" : ""}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${
          liked ? "fill-current scale-110" : "group-hover:scale-110"
        }`}
        strokeWidth={2}
      />
      <span className="text-sm font-medium tabular-nums" data-testid={`text-like-count-${targetType}-${targetId}`}>
        {count}
      </span>
    </button>
  );
}
