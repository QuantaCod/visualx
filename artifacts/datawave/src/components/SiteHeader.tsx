import { Link, useLocation } from "wouter";
import { Activity } from "lucide-react";

export function SiteHeader() {
  const [loc] = useLocation();
  const navItem = (href: string, label: string) => {
    const active = loc === href || (href !== "/" && loc.startsWith(href));
    return (
      <Link
        href={href}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          active
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid={`link-nav-${label.toLowerCase()}`}
      >
        {label}
      </Link>
    );
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center glow-primary">
            <Activity className="w-4 h-4 text-primary" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">
            DataWave
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItem("/", "Home")}
          {navItem("/datasets", "Datasets")}
          {navItem("/articles", "Articles")}
        </nav>
      </div>
    </header>
  );
}
