"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, UserPlus } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { FieldRow, SelectField, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import { LEAD_STATUS_LABEL } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/admin/components/ui/dialog";
import { Spinner } from "@/admin/components/ui/spinner";
import { currentUserName } from "@/admin/lib/auth";
import { useCreateItem } from "@/admin/lib/cms/hooks";
import type { Course, Lead } from "@/admin/lib/cms/types/academy";
import { formatRelative } from "@/admin/lib/format";

import { formatPhone } from "./lead-status";
import { LEAD_FLOW } from "./shared";

/** Same rule as the site form: 0xxxxxxxxx or +84xxxxxxxxx (spaces, dots, dashes allowed). */
const VN_PHONE = /^(?:0|\+?84)\d{9}$/;
const stripPhone = (value: string) => value.replace(/[\s.-]/g, "");

export const MANUAL_SOURCES = ["Hotline", "Facebook / Messenger", "Zalo", "Tại trung tâm", "Giới thiệu"];

const schema = z.object({
  name: z.string().trim().min(1, "Nhập họ và tên.").max(120, "Tối đa 120 ký tự."),
  phone: z
    .string()
    .trim()
    .min(1, "Nhập số điện thoại.")
    .refine((value) => VN_PHONE.test(stripPhone(value)), "Số điện thoại chưa đúng định dạng (0xxxxxxxxx)."),
  email: z.union([z.literal(""), z.email("Email chưa đúng định dạng.")]),
  courseId: z.string().min(1, "Chọn khóa học."),
  source: z.string().trim().min(1, "Nhập nguồn liên hệ."),
  status: z.enum(["new", "contacted", "enrolled", "closed"]),
  note: z.string().max(500, "Tối đa 500 ký tự."),
});
type LeadForm = z.infer<typeof schema>;

const empty = (courseId = ""): LeadForm => ({
  name: "",
  phone: "",
  email: "",
  courseId,
  source: "Hotline",
  status: "new",
  note: "",
});

/** "Thêm đăng ký thủ công" — for registrations taken by phone, at the studio, via social DMs… */
export function LeadCreateDialog({
  courses,
  leads,
  defaultCourseId,
  onCreated,
}: {
  courses: Course[];
  leads: Lead[];
  defaultCourseId?: string;
  onCreated: (lead: Lead) => void;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateItem("leads");
  const form = useForm<LeadForm>({
    resolver: zodResolver(schema),
    defaultValues: empty(defaultCourseId),
    mode: "onTouched",
  });

  const submit = async (values: LeadForm) => {
    const now = new Date().toISOString();
    const lead = await create.mutateAsync({
      name: values.name,
      phone: stripPhone(values.phone),
      email: values.email || undefined,
      courseId: values.courseId,
      status: values.status,
      source: values.source,
      note: values.note.trim() || undefined,
      history: values.status === "new" ? undefined : [{ status: values.status, at: now, by: currentUserName() }],
    });
    setOpen(false);
    form.reset(empty(defaultCourseId));
    onCreated(lead);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(empty(defaultCourseId));
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus /> Thêm đăng ký
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <FormProvider {...form}>
          <form noValidate onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Thêm đăng ký thủ công</DialogTitle>
              <DialogDescription>
                Ghi nhận học viên liên hệ qua hotline, mạng xã hội hoặc tại trung tâm.
              </DialogDescription>
            </DialogHeader>
            <TextField name="name" label="Họ và tên" required placeholder="Nguyễn Văn A" autoFocus />
            <FieldRow>
              <div className="flex flex-col gap-2">
                <TextField name="phone" label="Số điện thoại" required type="tel" placeholder="0912 345 678" />
                <DuplicateHint leads={leads} />
              </div>
              <TextField
                name="email"
                label="Email"
                type="email"
                placeholder="ban@email.com"
                description="Không bắt buộc."
              />
            </FieldRow>
            <SelectField
              name="courseId"
              label="Khóa học quan tâm"
              required
              placeholder="Chọn khóa học"
              options={courses.map((course) => ({ value: course.id, label: course.title }))}
            />
            <FieldRow>
              <div className="flex flex-col gap-2">
                <TextField name="source" label="Nguồn" required placeholder="Hotline" />
                <SourceChips />
              </div>
              <SelectField
                name="status"
                label="Trạng thái"
                options={LEAD_FLOW.map((status) => ({ value: status, label: LEAD_STATUS_LABEL[status] }))}
              />
            </FieldRow>
            <TextareaField
              name="note"
              label="Ghi chú"
              rows={3}
              maxLength={500}
              placeholder="Muốn học buổi tối, đã có controller…"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? <Spinner /> : <UserPlus />} Thêm đăng ký
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function SourceChips() {
  const source = useWatch({ name: "source" }) as string;
  const { setValue } = useFormContext<LeadForm>();
  return (
    <div className="flex flex-wrap gap-1">
      {MANUAL_SOURCES.filter((item) => item !== source).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setValue("source", item, { shouldDirty: true, shouldValidate: true })}
          className="text-muted-foreground hover:border-primary hover:text-primary rounded-full border border-dashed px-2 py-0.5 text-xs"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/** Warns when the phone number already registered (same person asking again). */
function DuplicateHint({ leads }: { leads: Lead[] }) {
  const phone = (useWatch({ name: "phone" }) as string) ?? "";
  const digits = stripPhone(phone);
  if (!VN_PHONE.test(digits)) return null;
  const matches = leads.filter((lead) => stripPhone(lead.phone) === digits);
  if (!matches.length) return null;
  const latest = matches[0];
  return (
    <p className="dark:text-warning flex items-start gap-1.5 text-xs text-[color-mix(in_oklch,var(--warning),black_35%)]">
      <AlertTriangle className="mt-px size-3.5 shrink-0" />
      <span>
        {formatPhone(digits)} đã đăng ký {matches.length} lần (gần nhất {formatRelative(latest.createdAt)},{" "}
        {latest.name}).
      </span>
    </p>
  );
}
