"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileWarning,
  FolderKanban,
  GraduationCap,
  Home,
  ImageUp,
  Inbox,
  Minus,
  Newspaper,
  PenSquare,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { LeadStatusBadge } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/admin/components/ui/empty";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/admin/components/ui/toggle-group";
import { useAuth } from "@/admin/lib/auth";
import { useCollection } from "@/admin/lib/cms/hooks";
import type { PublishStatus } from "@/admin/lib/cms/types/shared";
import { formatDate, formatNumber, formatRelative } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { CourseBars, LeadsAreaChart, StatusBreakdown } from "./dashboard-charts";
import {
  buildAttention,
  countByCourse,
  countByStatus,
  dailySeries,
  leadsIn,
  percentChange,
  RANGES,
  resolveAnchor,
  windowOf,
  type AttentionCheck,
  type RangeDays,
} from "./dashboard-data";
import { UserAvatar } from "./roles";

const QUICK_ACTIONS = [
  { label: "Tạo bài viết", href: "/admin/posts/new", icon: PenSquare },
  { label: "Thêm khóa học", href: "/admin/courses/new", icon: GraduationCap },
  { label: "Thêm dự án", href: "/admin/projects/new", icon: FolderKanban },
  { label: "Tải ảnh lên", href: "/admin/media", icon: ImageUp },
  { label: "Sửa trang chủ", href: "/admin/pages/home", icon: Home },
];

function greetingFor(hour: number) {
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 13) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

/** Dashboard: greeting + quick actions, KPIs, registration analytics, latest leads, content to fix. */
export function Dashboard() {
  const user = useAuth((state) => state.user);
  const leadsQuery = useCollection("leads");
  const coursesQuery = useCollection("courses");
  const projectsQuery = useCollection("projects");
  const postsQuery = useCollection("posts");
  const studentsQuery = useCollection("students");
  const [range, setRange] = useState<RangeDays>(30);
  // Captured once per visit: every figure on the page is computed against the same instant.
  const [now] = useState(() => Date.now());

  const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);
  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const leadsLoading = leadsQuery.isLoading || coursesQuery.isLoading;

  const stats = useMemo(() => {
    const { anchor, isFallback } = resolveAnchor(leads, now);
    const last30 = leadsIn(leads, windowOf(anchor, 30)).length;
    const prev30 = leadsIn(leads, windowOf(anchor, 30, 1)).length;
    const waiting = leads.filter((lead) => lead.status === "new");
    const oldestWaiting = waiting.reduce<string | undefined>(
      (oldest, lead) => (!oldest || lead.createdAt < oldest ? lead.createdAt : oldest),
      undefined,
    );
    const enrolled = leads.filter((lead) => lead.status === "enrolled").length;
    return { anchor, isFallback, last30, prev30, waiting: waiting.length, oldestWaiting, enrolled };
  }, [leads, now]);

  const rangeStats = useMemo(() => {
    const current = windowOf(stats.anchor, range);
    const inRange = leadsIn(leads, current);
    const previous = leadsIn(leads, windowOf(stats.anchor, range, 1)).length;
    const enrolledByCourse: Record<string, number> = {};
    for (const lead of inRange) {
      if (lead.status === "enrolled") enrolledByCourse[lead.courseId] = (enrolledByCourse[lead.courseId] ?? 0) + 1;
    }
    return {
      series: dailySeries(leads, current),
      total: inRange.length,
      previous,
      byStatus: countByStatus(inRange),
      byCourse: countByCourse(inRange, courses),
      enrolledByCourse,
    };
  }, [leads, courses, range, stats.anchor]);

  const attention = useMemo(
    () =>
      buildAttention({
        courses,
        projects: projectsQuery.data ?? [],
        posts: postsQuery.data ?? [],
        students: studentsQuery.data ?? [],
      }),
    [courses, projectsQuery.data, postsQuery.data, studentsQuery.data],
  );
  const attentionLoading =
    coursesQuery.isLoading || projectsQuery.isLoading || postsQuery.isLoading || studentsQuery.isLoading;
  const issues = attention.reduce((sum, check) => sum + (check.count ? 1 : 0), 0);

  const courseTitle = useMemo(() => new Map(courses.map((course) => [course.id, course.title])), [courses]);
  const today = new Date(now);
  const todayText = format(today, "EEEE, dd 'tháng' MM, yyyy", { locale: vi });

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting + quick actions */}
      <Card className="relative gap-0 overflow-hidden py-0">
        <div
          aria-hidden
          className="bg-primary/10 pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
        />
        <div className="relative flex flex-col gap-5 p-5 md:p-6">
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm first-letter:uppercase">{todayText}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance">
              {greetingFor(today.getHours())}, {user?.name ?? "bạn"}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {leadsLoading ? (
                "Đang tải số liệu…"
              ) : (
                <>
                  {stats.waiting ? (
                    <>
                      Có{" "}
                      <Link href="/admin/leads?status=new" className="text-primary font-medium hover:underline">
                        {stats.waiting} đăng ký mới
                      </Link>{" "}
                      đang chờ liên hệ
                    </>
                  ) : (
                    "Không có đăng ký nào đang chờ"
                  )}
                  {attentionLoading
                    ? "."
                    : issues
                      ? ` · ${issues} nhóm nội dung cần hoàn thiện.`
                      : " · nội dung đã sẵn sàng."}
                </>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {QUICK_ACTIONS.map((action, index) => (
              <Button
                key={action.href}
                asChild
                variant={index === 0 ? "default" : "outline"}
                className={cn("justify-start", index === 0 && "col-span-2 sm:col-span-1")}
              >
                <Link href={action.href}>
                  <action.icon />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/leads"
          icon={<Inbox />}
          label="Đăng ký tư vấn · 30 ngày"
          loading={leadsLoading}
          value={formatNumber(stats.last30)}
          footer={<Delta current={stats.last30} previous={stats.prev30} period="30 ngày trước" />}
        />
        <StatCard
          href="/admin/leads?status=new"
          icon={<Sparkles />}
          label="Đăng ký mới chưa xử lý"
          loading={leadsLoading}
          value={formatNumber(stats.waiting)}
          highlight={stats.waiting > 0}
          footer={
            stats.oldestWaiting ? (
              <span>Chờ lâu nhất: {formatRelative(stats.oldestWaiting)}</span>
            ) : (
              <span>Đã liên hệ hết các đăng ký</span>
            )
          }
        />
        <StatCard
          href="/admin/leads?status=enrolled"
          icon={<Target />}
          label="Tỉ lệ ghi danh"
          loading={leadsLoading}
          value={leads.length ? `${Math.round((stats.enrolled / leads.length) * 100)}%` : "–"}
          footer={
            <span>
              {stats.enrolled}/{leads.length} đăng ký đã ghi danh
            </span>
          }
        />
        <PublishedCard
          loading={coursesQuery.isLoading || projectsQuery.isLoading || postsQuery.isLoading}
          rows={[
            { label: "Khóa học", href: "/admin/courses", icon: <GraduationCap />, items: courses },
            { label: "Dự án", href: "/admin/projects", icon: <FolderKanban />, items: projectsQuery.data ?? [] },
            { label: "Bài viết", href: "/admin/posts", icon: <Newspaper />, items: postsQuery.data ?? [] },
          ]}
        />
      </div>

      {/* Registration analytics */}
      <section className="flex flex-col gap-4" aria-labelledby="leads-analytics">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="leads-analytics" className="text-lg font-semibold tracking-tight">
              Phân tích đăng ký tư vấn
            </h2>
            <p className="text-muted-foreground text-sm">
              {stats.isFallback
                ? `Dữ liệu mẫu — tính đến ${formatDate(stats.anchor)}, ngày có đăng ký mới nhất.`
                : "Đăng ký từ form “Đăng ký tư vấn” trên trang Academy."}
            </p>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={String(range)}
            onValueChange={(value) => value && setRange(Number(value) as RangeDays)}
            aria-label="Khoảng thời gian"
          >
            {RANGES.map((days) => (
              <ToggleGroupItem key={days} value={String(days)} className="px-3">
                {days} ngày
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Đăng ký tư vấn theo ngày</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {leadsLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <>
                    <span>
                      <span className="text-foreground font-medium">{formatNumber(rangeStats.total)}</span> đăng ký
                      trong {range} ngày
                    </span>
                    <Delta current={rangeStats.total} previous={rangeStats.previous} period={`${range} ngày trước`} />
                  </>
                )}
              </CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/leads">
                    Xem tất cả <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {leadsLoading ? (
                <Skeleton className="h-60 w-full sm:h-64" />
              ) : (
                <LeadsAreaChart data={rangeStats.series} />
              )}
              <div className="border-t pt-4">
                <p className="mb-3 text-sm font-medium">Trạng thái xử lý</p>
                {leadsLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <StatusBreakdown counts={rangeStats.byStatus} total={rangeStats.total} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đăng ký theo khóa học</CardTitle>
              <CardDescription>Khóa học được quan tâm nhiều nhất trong {range} ngày.</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full" />
                  ))}
                </div>
              ) : courses.length ? (
                <CourseBars rows={rangeStats.byCourse} enrolled={rangeStats.enrolledByCourse} />
              ) : (
                <SmallEmpty
                  icon={<GraduationCap />}
                  title="Chưa có khóa học"
                  description="Thêm khóa học để theo dõi đăng ký."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đăng ký mới nhất</CardTitle>
            <CardDescription>Liên hệ sớm để tăng tỉ lệ ghi danh.</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/leads">
                  Tất cả <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <ListSkeleton />
            ) : leads.length ? (
              <ul className="-mx-2 flex flex-col">
                {leads.slice(0, 6).map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href="/admin/leads"
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                    >
                      <UserAvatar name={lead.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{lead.name}</span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {courseTitle.get(lead.courseId) ?? "Khóa học đã xóa"} · {formatRelative(lead.createdAt)}
                        </span>
                      </span>
                      <LeadStatusBadge status={lead.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <SmallEmpty
                icon={<Inbox />}
                title="Chưa có đăng ký"
                description="Đăng ký từ website sẽ xuất hiện tại đây."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nội dung cần chú ý</CardTitle>
            <CardDescription>Hoàn thiện để website hiển thị đẹp và chuẩn SEO.</CardDescription>
          </CardHeader>
          <CardContent>
            {attentionLoading ? <ListSkeleton rows={4} /> : <AttentionList checks={attention} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

function StatCard({
  href,
  icon,
  label,
  value,
  footer,
  loading,
  highlight,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
  footer: ReactNode;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group focus-visible:ring-ring/50 rounded-xl focus-visible:ring-3 focus-visible:outline-none"
    >
      <Card className="group-hover:ring-primary/40 h-full gap-2 transition-shadow">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 [&_svg]:size-4">
            {icon}
            {label}
          </CardDescription>
          <CardAction>
            <ArrowUpRight className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {loading ? (
            <>
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-4 w-36" />
            </>
          ) : (
            <>
              <span className={cn("text-3xl font-semibold tracking-tight", highlight && "text-primary")}>{value}</span>
              <span className="text-muted-foreground text-xs">{footer}</span>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

/** "+12% so với 30 ngày trước" — green when up (more registrations is good), red when down. */
function Delta({ current, previous, period }: { current: number; previous: number; period: string }) {
  const change = percentChange(current, previous);
  if (change === null) {
    return <span className="text-muted-foreground text-xs">Chưa có dữ liệu {period} để so sánh</span>;
  }
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return (
    <span className="text-muted-foreground inline-flex flex-wrap items-center gap-1 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 font-medium",
          change > 0 && "bg-success/12 text-success",
          change < 0 && "bg-destructive/10 text-destructive",
          change === 0 && "bg-muted",
        )}
      >
        <Icon className="size-3" />
        {change > 0 ? "+" : ""}
        {change}%
      </span>
      so với {period}
    </span>
  );
}

type PublishRow = {
  label: string;
  href: string;
  icon: ReactNode;
  items: { status: PublishStatus }[];
};

function PublishedCard({ rows, loading }: { rows: PublishRow[]; loading: boolean }) {
  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardDescription>Nội dung đã xuất bản</CardDescription>
      </CardHeader>
      <CardContent className="-mx-1.5 flex flex-col">
        {rows.map((row) => {
          const published = row.items.filter((item) => item.status === "published").length;
          const drafts = row.items.length - published;
          return (
            <Link
              key={row.href}
              href={row.href}
              className="[&_svg]:text-muted-foreground flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-muted [&_svg]:size-4"
            >
              {row.icon}
              <span className="flex-1">{row.label}</span>
              {loading ? (
                <Skeleton className="h-4 w-14" />
              ) : (
                <>
                  <span className="text-base font-semibold tabular-nums">{published}</span>
                  <span
                    className={cn(
                      "w-14 text-right text-xs tabular-nums",
                      drafts
                        ? "dark:text-warning font-medium text-[color-mix(in_oklch,var(--warning),black_35%)]"
                        : "text-muted-foreground",
                    )}
                  >
                    {drafts ? `${drafts} nháp` : "0 nháp"}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AttentionList({ checks }: { checks: AttentionCheck[] }) {
  const failing = checks.filter((check) => check.count > 0);
  return (
    <div className="flex flex-col gap-3">
      {failing.length === 0 ? (
        <div className="bg-success/10 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
          <CheckCircle2 className="text-success size-5 shrink-0" />
          <span>
            <span className="font-medium">Tuyệt vời!</span>{" "}
            <span className="text-muted-foreground">Không có nội dung nào cần sửa.</span>
          </span>
        </div>
      ) : null}
      <ul className="flex flex-col gap-1">
        {[...failing, ...checks.filter((check) => check.count === 0)].map((check) => (
          <li key={check.key} className="flex gap-3 rounded-lg py-1.5">
            {check.count ? (
              <TriangleAlert className="dark:text-warning mt-0.5 size-4 shrink-0 text-[color-mix(in_oklch,var(--warning),black_25%)]" />
            ) : (
              <CheckCircle2 className="text-success mt-0.5 size-4 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm", check.count ? "font-medium" : "text-muted-foreground")}>
                {check.count ? check.title(check.count) : check.okTitle}
              </p>
              {check.count ? (
                <>
                  <p className="text-muted-foreground text-xs">{check.hint}</p>
                  <ul className="mt-1.5 flex flex-col">
                    {check.items.slice(0, 3).map((item) => (
                      <li key={`${check.key}-${item.id}`}>
                        <Link
                          href={item.href}
                          className="-mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted"
                        >
                          <FileWarning className="text-muted-foreground size-3.5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.detail ? (
                            <span className="text-muted-foreground shrink-0 text-xs">{item.detail}</span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {check.items.length > 3 ? (
                    <p className="text-muted-foreground mt-0.5 text-xs">và {check.items.length - 3} mục khác</p>
                  ) : null}
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SmallEmpty({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <Empty className="border py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
