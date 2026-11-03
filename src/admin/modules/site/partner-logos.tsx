"use client";

import { ArrowUpRight, Handshake } from "lucide-react";
import Link from "next/link";

import { Thumb } from "@/admin/components/cms/image-fields";
import { Button } from "@/admin/components/ui/button";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { useCollection } from "@/admin/lib/cms/hooks";
import type { Partner } from "@/admin/lib/cms/types/pages";
import { cn } from "@/lib/utils";

/** Partners shown at `placement`, in their saved order. */
export function usePlacedPartners(placement: "home" | "partners") {
  const query = useCollection("partners");
  const partners = (query.data ?? []).filter((partner) =>
    placement === "home" ? partner.showOnHome : partner.showOnPartnersPage,
  );
  return { partners, isLoading: query.isLoading };
}

/** Logos on the site's dark background. */
export function LogoRow({
  partners,
  className,
  logoClassName,
}: {
  partners: Partner[];
  className?: string;
  logoClassName?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-5 gap-y-3", className)}>
      {partners.map((partner) => (
        <Thumb
          key={partner.id}
          image={partner.logo}
          fit="contain"
          checker={false}
          className={cn("h-6 w-auto max-w-20 bg-transparent", logoClassName)}
        />
      ))}
    </div>
  );
}

/**
 * Read-only strip of the partner logos used by a page section + a link to the Partners module
 * (logos are managed there, not in the page editor).
 */
export function PartnerLogosPanel({ placement }: { placement: "home" | "partners" }) {
  const { partners, isLoading } = usePlacedPartners(placement);
  const toggle = placement === "home" ? "Dải logo trang chủ" : "Trang Partners";
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg bg-[#050101] px-4 py-5">
        {isLoading ? (
          <div className="flex justify-center gap-4">
            <Skeleton className="h-6 w-16 bg-white/10" />
            <Skeleton className="h-6 w-16 bg-white/10" />
            <Skeleton className="h-6 w-16 bg-white/10" />
          </div>
        ) : partners.length ? (
          <LogoRow partners={partners} />
        ) : (
          <p className="flex items-center justify-center gap-2 py-2 text-center text-xs text-white/55">
            <Handshake className="size-4" /> Chưa có đối tác nào bật “{toggle}”.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          {partners.length} logo · thứ tự và hiển thị được quản lý trong mục Đối tác (bật “{toggle}”).
        </p>
        <Button asChild variant="outline" size="sm" className="w-fit shrink-0">
          <Link href="/admin/partners">
            Quản lý đối tác <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
