"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { useCollection, useCreateItem, useDeleteItems, useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Project } from "@/admin/lib/cms/types/projects";
import type { PublishStatus } from "@/admin/lib/cms/types/shared";

import { uniqueSlug } from "./project-utils";

/** List-level project actions: delete (confirmed), publish / unpublish (bulk), duplicate. */
export function useProjectActions() {
  const router = useRouter();
  const confirm = useConfirm();
  const { data: projects } = useCollection("projects");
  const remove = useDeleteItems("projects");
  const update = useUpdateItem("projects", { silent: true });
  const create = useCreateItem("projects", { silent: true });

  const askDelete = async (rows: Project[]) => {
    const ok = await confirm({
      title: rows.length === 1 ? `Xóa dự án "${rows[0].name}"?` : `Xóa ${rows.length} dự án?`,
      description:
        rows.length === 1
          ? `Trang /projects/${rows[0].slug} sẽ không còn truy cập được. Ảnh trong thư viện media vẫn được giữ lại.`
          : "Các trang chi tiết dự án sẽ không còn truy cập được. Ảnh trong thư viện media vẫn được giữ lại.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) await remove.mutateAsync(rows.map((row) => row.id));
    return ok;
  };

  const setStatus = async (rows: Project[], status: PublishStatus) => {
    const targets = rows.filter((row) => row.status !== status);
    if (!targets.length) {
      toast.info(status === "published" ? "Các dự án đã được xuất bản." : "Các dự án đã là bản nháp.");
      return;
    }
    // Sequential on purpose: the local adapter rewrites the whole collection per update (parallel writes would race).
    for (const row of targets) await update.mutateAsync({ id: row.id, patch: { status } });
    const subject = targets.length === 1 ? `“${targets[0].name}”` : `${targets.length} dự án`;
    toast.success(status === "published" ? `Đã xuất bản ${subject}.` : `Đã chuyển ${subject} về bản nháp.`);
  };

  const duplicate = async (project: Project) => {
    const { id: _id, createdAt: _created, updatedAt: _updated, ...rest } = project;
    void _id;
    void _created;
    void _updated;
    const created = await create.mutateAsync({
      ...structuredClone(rest),
      slug: uniqueSlug(
        `${project.slug}-ban-sao`,
        (projects ?? []).map((item) => item.slug),
      ),
      name: `${project.name} (bản sao)`,
      status: "draft",
      order: (projects ?? []).reduce((max, item) => Math.max(max, item.order), -1) + 1,
    });
    toast.success("Đã tạo bản sao (bản nháp).");
    router.push(`/admin/projects/${created.id}`);
  };

  return { askDelete, setStatus, duplicate, isBusy: update.isPending || remove.isPending || create.isPending };
}
