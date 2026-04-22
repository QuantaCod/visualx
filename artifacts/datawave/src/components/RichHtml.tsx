import { sanitizeHtml } from "@/lib/sanitize";

export function RichHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`prose prose-invert max-w-none prose-invert-tweak ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
