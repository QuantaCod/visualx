import { Link } from "wouter";
import { FileText } from "lucide-react";
import { TagChip } from "./TagChip";
import { LikeButton } from "./LikeButton";
import type { ArticleSummary } from "@workspace/api-client-react";

type Item = ArticleSummary;

export function ArticleCard({ item }: { item: Item }) {
  return (
    <article
      className="group rounded-xl border border-border bg-card overflow-hidden hover-elevate transition-all"
      data-testid={`card-article-${item.slug}`}
    >
      {item.coverImage ? (
        <Link href={`/article/${item.slug}`} className="block aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-accent/10 to-transparent grid-bg flex items-center justify-center">
          <FileText className="w-10 h-10 text-primary/40" strokeWidth={1.5} />
        </div>
      )}
      <div className="p-5">
        <Link href={`/article/${item.slug}`} className="block">
          <h3 className="text-lg font-semibold leading-tight mb-1.5 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {item.excerpt}
          </p>
        </Link>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.slice(0, 4).map((t: string) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-mono">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <LikeButton
            targetType="article"
            targetId={item.id}
            slug={item.slug}
            initialCount={item.likeCount}
          />
        </div>
      </div>
    </article>
  );
}
