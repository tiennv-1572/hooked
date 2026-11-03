"use client";

import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { LEAD_STATUS_LABEL, LeadStatusBadge } from "@/admin/components/cms/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import { currentUserName } from "@/admin/lib/auth";
import { useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Lead, LeadStatus } from "@/admin/lib/cms/types/academy";
import { cn } from "@/lib/utils";

import { LEAD_FLOW, LEAD_STATUS_HINT } from "./shared";

export const LEAD_DOT: Record<LeadStatus, string> = {
  new: "bg-primary",
  contacted: "bg-chart-3",
  enrolled: "bg-success",
  closed: "bg-muted-foreground/60",
};

/** "0912345678" → "0912 345 678" (other formats are returned unchanged). */
export function formatPhone(phone: string) {
  const digits = phone.replace(/[\s.-]/g, "");
  if (/^0\d{9}$/.test(digits)) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return phone;
}

/**
 * Changes the status of one or many leads, appending to each lead's history (who / when).
 * Single changes get an "Hoàn tác" toast action.
 */
export function useSetLeadStatus() {
  const update = useUpdateItem("leads", { silent: true });
  return async (leads: Lead[], status: LeadStatus) => {
    const targets = leads.filter((lead) => lead.status !== status);
    if (!targets.length) return;
    const at = new Date().toISOString();
    const by = currentUserName();
    // Sequential: the storage adapter rewrites the whole collection per update, so parallel writes would race.
    for (const lead of targets) {
      await update.mutateAsync({
        id: lead.id,
        patch: { status, history: [...(lead.history ?? []), { status, at, by }] },
      });
    }
    if (targets.length === 1) {
      const [lead] = targets;
      toast.success(`${lead.name} → ${LEAD_STATUS_LABEL[status]}`, {
        action: {
          label: "Hoàn tác",
          onClick: () => update.mutate({ id: lead.id, patch: { status: lead.status, history: lead.history ?? [] } }),
        },
      });
    } else {
      toast.success(`Đã chuyển ${targets.length} đăng ký sang “${LEAD_STATUS_LABEL[status]}”.`);
    }
  };
}

/** Inline status pill that opens the workflow menu (used in table rows). */
export function LeadStatusMenu({ lead, onChange }: { lead: Lead; onChange: (status: LeadStatus) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Trạng thái: ${LEAD_STATUS_LABEL[lead.status]} — đổi trạng thái`}
          className="group/status focus-visible:ring-ring/50 inline-flex items-center gap-0.5 rounded-full outline-none focus-visible:ring-3"
        >
          <LeadStatusBadge status={lead.status} />
          <ChevronDown className="text-muted-foreground size-3.5 opacity-60 transition-opacity group-hover/status:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-muted-foreground text-xs">Chuyển trạng thái</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LEAD_FLOW.map((status) => (
          <DropdownMenuItem key={status} onSelect={() => onChange(status)} className="items-start gap-2.5">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", LEAD_DOT[status])} />
            <span className="grid flex-1 gap-0.5">
              <span className="font-medium">{LEAD_STATUS_LABEL[status]}</span>
              <span className="text-muted-foreground text-xs">{LEAD_STATUS_HINT[status]}</span>
            </span>
            {status === lead.status ? <Check className="text-primary mt-0.5 size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
