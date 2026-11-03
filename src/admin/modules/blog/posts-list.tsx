"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, Copy, ExternalLink, FilePen, Globe, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { DataTable, RowActions, SortHeader } from "@/admin/components/cms/data-table";
import { Thumb } from "@/admin/components/cms/image-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { useCollection, useCreateItem, useDeleteItems, useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Post } from "@/admin/lib/cms/types/blog";
import { formatDate, formatDateTime, formatRelative } from "@/admin/lib/format";

import { PostStateBadge } from "./post-state-badge";
import {
  blogPostHref,
  POST_STATE_LABEL,
  postState,
  postWordCount,
  readingMinutes,
  uniqueSlug,
  useNow,
  type PostState,
} from "./post-utils";

type PostRow = Post & { state: PostState; minutes: number };

/** `/admin/posts` — every blog post with status (draft / scheduled / published), tags and reading time. */
export function PostsList() {
  const { data, isLoading } = useCollection("posts");
  const remove = useDeleteItems("posts");
  const update = useUpdateItem("posts", { silent: true });
  const create = useCreateItem("posts", { silent: true });
  const confirm = useConfirm();
  const router = useRouter();
  const now = useNow();

  const rows = useMemo<PostRow[] | undefined>(
    () =>
      data?.map((post) => ({
        ...post,
        state: postState(post, now),
        minutes: readingMinutes(postWordCount(post)),
      })),
    [data, now],
  );

  const counts = useMemo(() => {
    const result: Record<PostState, number> = { draft: 0, scheduled: 0, published: 0 };
    for (const row of rows ?? []) result[row.state] += 1;
    return result;
  }, [rows]);

  const tagOptions = useMemo(
    () => [...new Set((data ?? []).flatMap((post) => post.tags))].sort().map((tag) => ({ label: tag, value: tag })),
    [data],
  );

  const askDelete = async (posts: Post[]) => {
    const ok = await confirm({
      title: posts.length === 1 ? `Xóa bài viết "${posts[0].title}"?` : `Xóa ${posts.length} bài viết?`,
      description: "Bài viết sẽ bị gỡ khỏi trang Blog. Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) await remove.mutateAsync(posts.map((post) => post.id));
    return ok;
  };

  const setPublished = async (posts: Post[], published: boolean) => {
    const stamp = new Date().toISOString();
    await Promise.all(
      posts.map((post) =>
        update.mutateAsync({
          id: post.id,
          patch: published ? { status: "published", publishedAt: post.publishedAt ?? stamp } : { status: "draft" },
        }),
      ),
    );
    const noun = posts.length === 1 ? `“${posts[0].title}”` : `${posts.length} bài viết`;
    toast.success(published ? `Đã xuất bản ${noun}.` : `Đã chuyển ${noun} về bản nháp.`);
  };

  const duplicate = async (post: Post) => {
    const { id: _id, createdAt: _created, updatedAt: _updated, ...rest } = post;
    void _id;
    void _created;
    void _updated;
    const copy = await create.mutateAsync({
      ...rest,
      slug: uniqueSlug(
        `${post.slug}-ban-sao`,
        (data ?? []).map((item) => item.slug),
      ),
      title: `${post.title} (bản sao)`,
      status: "draft",
      publishedAt: undefined,
    });
    toast.success("Đã tạo bản sao (bản nháp).");
    router.push(`/admin/posts/${copy.id}`);
  };

  const columns: ColumnDef<PostRow, unknown>[] = [
    {
      accessorKey: "title",
      meta: { label: "Bài viết" },
      header: ({ column }) => <SortHeader column={column} title="Bài viết" />,
      cell: ({ row }) => (
        <div className="flex min-w-64 items-center gap-3">
          <Thumb image={row.original.cover} className="aspect-[3/2] w-20 shrink-0 rounded-md border" />
          <div className="max-w-[420px] min-w-0">
            <p className="text-primary truncate text-[11px] font-semibold tracking-wide uppercase">
              {row.original.kicker}
            </p>
            <p className="line-clamp-2 leading-snug font-medium whitespace-normal">{row.original.title}</p>
            <p className="text-muted-foreground truncate text-xs">/blog/{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "state",
      meta: { label: "Trạng thái" },
      header: ({ column }) => <SortHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => <PostStateBadge state={row.original.state} />,
    },
    {
      accessorKey: "tags",
      meta: { label: "Thẻ" },
      header: "Thẻ",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.tags.length ? (
          <div className="flex max-w-48 flex-wrap gap-1">
            {row.original.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "author",
      meta: { label: "Tác giả" },
      header: ({ column }) => <SortHeader column={column} title="Tác giả" />,
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.author}</span>,
    },
    {
      id: "publishedAt",
      accessorFn: (row) => (row.publishedAt ? Date.parse(row.publishedAt) : 0),
      meta: { label: "Ngày đăng" },
      header: ({ column }) => <SortHeader column={column} title="Ngày đăng" />,
      cell: ({ row }) => {
        const { publishedAt, state } = row.original;
        if (!publishedAt) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="whitespace-nowrap" title={formatDateTime(publishedAt)}>
            <p className={state === "scheduled" ? "text-chart-3 flex items-center gap-1" : undefined}>
              {state === "scheduled" ? <CalendarClock className="size-3.5" /> : null}
              {formatDate(publishedAt)}
            </p>
            <p className="text-muted-foreground text-xs">
              {state === "scheduled" ? `lúc ${formatDateTime(publishedAt).slice(11)}` : formatRelative(publishedAt)}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "minutes",
      meta: { label: "Thời gian đọc" },
      header: ({ column }) => <SortHeader column={column} title="Đọc" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap tabular-nums">{row.original.minutes} phút</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      meta: { label: "Cập nhật" },
      header: ({ column }) => <SortHeader column={column} title="Cập nhật" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">{formatRelative(row.original.updatedAt)}</span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      size: 48,
      cell: ({ row }) => {
        const post = row.original;
        const live = post.state === "published";
        return (
          <RowActions
            actions={[
              { label: "Chỉnh sửa", icon: <Pencil />, href: `/admin/posts/${post.id}` },
              ...(live
                ? [{ label: "Xem trên website", icon: <ExternalLink />, href: blogPostHref(post.slug), external: true }]
                : []),
              post.status === "published"
                ? { label: "Chuyển về bản nháp", icon: <FilePen />, onSelect: () => void setPublished([post], false) }
                : { label: "Xuất bản ngay", icon: <Globe />, onSelect: () => void setPublished([post], true) },
              { label: "Nhân bản", icon: <Copy />, onSelect: () => void duplicate(post) },
              {
                label: "Xóa",
                icon: <Trash2 />,
                destructive: true,
                separatorBefore: true,
                onSelect: () => void askDelete([post]),
              },
            ]}
          />
        );
      },
    },
  ];

  const total = rows?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bài viết"
        description={
          isLoading
            ? "Câu chuyện, tin tức hiển thị trên trang Blog."
            : [
                `${total} bài viết`,
                ...(["published", "scheduled", "draft"] as const)
                  .filter((state) => counts[state])
                  .map((state) => `${counts[state]} ${POST_STATE_LABEL[state].toLowerCase()}`),
              ].join(" · ")
        }
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Bài viết" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <a href="/blog" target="_blank" rel="noreferrer">
                <ExternalLink /> Trang Blog
              </a>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/posts/new">
                <Plus /> Viết bài mới
              </Link>
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchKeys={["title", "kicker", "intro", "slug", "author", "tags"]}
        searchPlaceholder="Tìm theo tiêu đề, nhãn, thẻ…"
        initialSorting={[{ id: "publishedAt", desc: true }]}
        initialHidden={["updatedAt"]}
        filters={[
          {
            columnId: "state",
            title: "Trạng thái",
            options: (["published", "scheduled", "draft"] as const).map((state) => ({
              label: POST_STATE_LABEL[state],
              value: state,
            })),
          },
          ...(tagOptions.length ? [{ columnId: "tags", title: "Thẻ", options: tagOptions }] : []),
        ]}
        getRowHref={(row) => `/admin/posts/${row.id}`}
        bulkActions={(selected, clear) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await setPublished(selected, true);
                clear();
              }}
            >
              <Globe /> Xuất bản
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await setPublished(selected, false);
                clear();
              }}
            >
              <FilePen /> Chuyển về nháp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={async () => {
                if (await askDelete(selected)) clear();
              }}
            >
              <Trash2 /> Xóa
            </Button>
          </>
        )}
        emptyState={{
          title: "Chưa có bài viết",
          description: "Viết câu chuyện đầu tiên cho trang Blog.",
          icon: <Newspaper />,
          action: (
            <Button asChild size="sm">
              <Link href="/admin/posts/new">
                <Plus /> Viết bài mới
              </Link>
            </Button>
          ),
        }}
      />
    </div>
  );
}
