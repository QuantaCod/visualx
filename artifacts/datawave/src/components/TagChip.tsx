import { Link } from "wouter";

export function TagChip({
  tag,
  active,
  asLink = true,
  onClick,
}: {
  tag: string;
  active?: boolean;
  asLink?: boolean;
  onClick?: () => void;
}) {
  const cls = `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
    active
      ? "bg-primary/15 border-primary/40 text-primary"
      : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
  }`;
  if (!asLink) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cls}
        data-testid={`tag-${tag}`}
      >
        #{tag}
      </button>
    );
  }
  return (
    <Link href={`/?tag=${encodeURIComponent(tag)}`} className={cls} data-testid={`tag-${tag}`}>
      #{tag}
    </Link>
  );
}
