import { useQuery } from "@tanstack/react-query";
import { adminMe } from "@/lib/admin";

export function useAdminAuth() {
  return useQuery({
    queryKey: ["admin-me"],
    queryFn: adminMe,
    staleTime: 30_000,
  });
}
