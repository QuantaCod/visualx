import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { data, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && !data) navigate("/admin");
  }, [data, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (!data) return null;
  return <>{children}</>;
}
