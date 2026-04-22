export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-[1400px] px-6 py-10 text-sm text-muted-foreground space-y-2">
        <div className="font-semibold text-foreground">
          VisualX <span className="text-muted-foreground font-normal">— data managed by VisualX</span>
        </div>
        <div>A product of CodeX by Sahani Initiatives.</div>
        <div className="text-xs opacity-80">
          VisualX is a registered trademark of CodeX and fully owned by Sahani Initiatives. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
