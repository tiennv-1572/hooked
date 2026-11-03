"use client";

import Link from "next/link";
import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { LEAD_STATUS_LABEL } from "@/admin/components/cms/status-badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/admin/components/ui/chart";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/admin/components/ui/tooltip";
import type { LeadStatus } from "@/admin/lib/cms/types/academy";
import { formatNumber } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { longDay, STATUS_COLOR, STATUS_ORDER, type CourseCount, type DailyPoint } from "./dashboard-data";

const leadsConfig = { leads: { label: "Đăng ký", color: "var(--chart-1)" } } satisfies ChartConfig;

/** Daily registrations — single series, so no legend: the card title names it. */
export function LeadsAreaChart({ data }: { data: DailyPoint[] }) {
  const gradientId = `leads-fill-${useId().replace(/:/g, "")}`;
  const dense = data.length > 31;
  return (
    <ChartContainer config={leadsConfig} className="aspect-auto h-60 w-full sm:h-64">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-leads)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-leads)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={dense ? 32 : 20} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tickMargin={4} />
        <ChartTooltip
          cursor={{ strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as DailyPoint | undefined;
                return point ? longDay(point.date) : null;
              }}
            />
          }
        />
        <Area
          dataKey="leads"
          type="monotone"
          fill={`url(#${gradientId})`}
          stroke="var(--color-leads)"
          strokeWidth={2}
          dot={data.length <= 7 ? { r: 4, strokeWidth: 2, stroke: "var(--card)", fill: "var(--color-leads)" } : false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

/** Lead pipeline as one segmented bar (part-to-whole) + a legend that carries every number. */
export function StatusBreakdown({ counts, total }: { counts: Record<LeadStatus, number>; total: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label="Tỉ lệ đăng ký theo trạng thái"
      >
        {total
          ? STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => (
              <Tooltip key={status}>
                <TooltipTrigger asChild>
                  <span
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${(counts[status] / total) * 100}%`, background: STATUS_COLOR[status] }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {LEAD_STATUS_LABEL[status]}: {counts[status]} ({Math.round((counts[status] / total) * 100)}%)
                </TooltipContent>
              </Tooltip>
            ))
          : null}
      </div>
      <div className="-mx-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 sm:flex sm:flex-wrap sm:gap-x-4">
        {STATUS_ORDER.map((status) => (
          <Link
            key={status}
            href={`/admin/leads?status=${status}`}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm whitespace-nowrap transition-colors hover:bg-muted"
          >
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: STATUS_COLOR[status] }} />
            <span className="text-muted-foreground">{LEAD_STATUS_LABEL[status]}</span>
            <span className="font-medium tabular-nums">{counts[status]}</span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {total ? `${Math.round((counts[status] / total) * 100)}%` : "–"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Ranked horizontal bars (one series → one colour). HTML instead of an SVG axis so long course names
 * ("Producer / HipHop · R&B · Ballad") wrap gracefully down to 390px.
 */
export function CourseBars({ rows, enrolled }: { rows: CourseCount[]; enrolled: Record<string, number> }) {
  const max = Math.max(1, ...rows.map((row) => row.leads));
  const total = rows.reduce((sum, row) => sum + row.leads, 0);
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((row) => {
        const share = total ? Math.round((row.leads / total) * 100) : 0;
        return (
          <li key={row.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group flex flex-col gap-1.5" tabIndex={0}>
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{row.label}</span>
                    <span className="font-medium tabular-nums">{formatNumber(row.leads)}</span>
                    <span className="text-muted-foreground w-9 text-right text-xs tabular-nums">{share}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={cn("bg-chart-1 h-full rounded-full transition-[width]", row.leads === 0 && "hidden")}
                      style={{ width: `${(row.leads / max) * 100}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start">
                {row.label}: {row.leads} đăng ký · {enrolled[row.id] ?? 0} đã ghi danh
              </TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
