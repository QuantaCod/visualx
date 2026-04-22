import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { adminLogin } from "@/lib/admin";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { PageMeta } from "@/components/PageMeta";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: authed } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authed) navigate("/admin/dashboard");
  }, [authed, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const ok = await adminLogin(password);
    setBusy(false);
    if (!ok) {
      setErr("Invalid password");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin-me"] });
    navigate("/admin/dashboard");
  };

  return (
    <>
      <PageMeta title="Admin login" />
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center mb-5 glow-primary">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Admin access</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the admin password to manage datasets and articles.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                required
                autoFocus
                data-testid="input-admin-password"
              />
            </div>
            {err && (
              <div className="text-sm text-destructive" data-testid="text-admin-error">{err}</div>
            )}
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover-elevate disabled:opacity-60"
              data-testid="button-admin-login"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
