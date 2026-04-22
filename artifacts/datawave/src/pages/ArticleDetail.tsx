import { useRoute, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useGetArticle } from "@workspace/api-client-react";
import { PageMeta } from "@/components/PageMeta";
import { RichHtml } from "@/components/RichHtml";
import { TagChip } from "@/components/TagChip";
import { LikeButton } from "@/components/LikeButton";
import NotFound from "./not-found";

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug ?? "";
  const { data, isLoading, error } = useGetArticle(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-16 text-muted-foreground">
        Loading article…
      </div>
    );
  }
  if (error || !data) return <NotFound />;

  return (
    <>
      <PageMeta
        title={data.title}
        description={data.metaDescription || data.excerpt}
        image={data.coverImage || undefined}
        type="article"
      />
      <article className="mx-auto max-w-[900px] px-6 py-12">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back-articles"
        >
          <ArrowLeft className="w-4 h-4" /> Back to articles
        </Link>
        <div className="mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Article · {new Date(data.createdAt).toLocaleDateString()}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-article-title">
          {data.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">{data.excerpt}</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {data.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>

        {data.coverImage && (
          <img
            src={data.coverImage}
            alt={data.title}
            className="w-full rounded-xl border border-border mb-8"
            loading="lazy"
          />
        )}

        <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
          <span className="text-sm text-muted-foreground">Enjoyed this?</span>
          <LikeButton
            targetType="article"
            targetId={data.id}
            slug={data.slug}
            initialCount={data.likeCount}
          />
        </div>

        <RichHtml html={data.contentHtml} />
      </article>
    </>
  );
}
