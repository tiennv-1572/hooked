"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Spinner } from "@/admin/components/ui/spinner";
import { useAuth } from "@/admin/lib/auth";
import { authApi } from "@/admin/lib/cms/http-adapter";

const OFFLINE = process.env.NEXT_PUBLIC_CMS_ADAPTER === "local";

/**
 * Lets the panel render only for a valid session. The cached profile paints immediately; the httpOnly cookie is
 * then re-checked with GET /api/admin/auth/me (expired, revoked or disabled accounts are sent to /admin/login).
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, hydrated, signIn, signOut } = useAuth();
  const [verified, setVerified] = useState(OFFLINE);

  useEffect(() => {
    if (OFFLINE) return;
    let cancelled = false;
    authApi
      .me()
      .then((current) => {
        if (cancelled) return;
        if (current) signIn(current);
        else signOut();
        setVerified(true);
      })
      .catch(() => !cancelled && setVerified(true));
    return () => {
      cancelled = true;
    };
  }, [signIn, signOut]);

  useEffect(() => {
    if (hydrated && verified && !user) {
      const next = window.location.pathname + window.location.search;
      router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
    }
  }, [hydrated, verified, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="text-primary size-6" />
      </div>
    );
  }
  return children;
}
