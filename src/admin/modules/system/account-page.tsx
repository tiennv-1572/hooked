"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CircleCheck,
  CircleDashed,
  Database,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { FieldRow, TextField } from "@/admin/components/cms/form-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { Alert, AlertDescription } from "@/admin/components/ui/alert";
import { Button } from "@/admin/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { Spinner } from "@/admin/components/ui/spinner";
import { logout, useAuth } from "@/admin/lib/auth";
import { authApi } from "@/admin/lib/cms/http-adapter";
import { useCollection, useResetCms, useUpdateItem } from "@/admin/lib/cms/hooks";
import {
  THEME_PRESETS,
  usePreferences,
  type ContentWidth,
  type ThemeMode,
  type ThemePreset,
} from "@/admin/lib/preferences";
import { formatDate, formatRelative } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { PasswordInput } from "./password-input";
import { RoleBadge, STATUS_META, UserAvatar } from "./roles";

/** My account: profile (synced to the users list + session), password, interface preferences, demo data. */
export function AccountPage() {
  const session = useAuth((state) => state.user);
  const { data: users, isLoading } = useCollection("users");
  const signIn = useAuth((state) => state.signIn);
  const me = users?.find((user) => user.id === session?.id) ?? users?.find((user) => user.email === session?.email);

  // The users list is the source of truth: keep the session in sync when the record changes elsewhere
  // (edited from Người dùng, or restored by "Khôi phục dữ liệu mẫu").
  useEffect(() => {
    if (session && me && (me.name !== session.name || me.email !== session.email || me.role !== session.role)) {
      signIn({ ...session, name: me.name, email: me.email, role: me.role });
    }
  }, [me, session, signIn]);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tài khoản của tôi"
        description="Hồ sơ, mật khẩu và tùy chọn giao diện của riêng bạn."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Tài khoản của tôi" }]}
      />

      <Card className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-primary/10 pointer-events-none absolute -top-20 -right-10 size-56 rounded-full blur-3xl"
        />
        <CardContent className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar name={session.name} className="size-16 text-lg [&_[data-slot=avatar-fallback]]:text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight">{session.name}</h2>
              <RoleBadge role={me?.role ?? session.role} />
            </div>
            <p className="text-muted-foreground truncate text-sm">{session.email}</p>
          </div>
          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Stat label="Trạng thái" value={isLoading ? null : me ? STATUS_META[me.status].label : "—"} />
            <Stat label="Tham gia" value={isLoading ? null : me ? formatDate(me.createdAt) : "—"} />
            <Stat
              label="Hoạt động"
              value={isLoading ? null : me?.lastActiveAt ? formatRelative(me.lastActiveAt) : "Hôm nay"}
            />
          </dl>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ) : (
          <ProfileCard key={me?.updatedAt ?? session.id} userId={me?.id} />
        )}
        <PasswordCard />
      </div>

      <PreferencesCard />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DemoDataCard />
        <SessionCard />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="truncate font-medium">{value === null ? <Skeleton className="mt-1 h-4 w-16" /> : value}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Profile

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nhập họ tên (ít nhất 2 ký tự).").max(60, "Tối đa 60 ký tự."),
  email: z.email("Email không hợp lệ."),
});
type ProfileValues = z.infer<typeof profileSchema>;

function ProfileCard({ userId }: { userId?: string }) {
  const session = useAuth((state) => state.user)!;
  const signIn = useAuth((state) => state.signIn);
  const { data: users } = useCollection("users");
  const update = useUpdateItem("users", { silent: true });
  const form = useForm<ProfileValues>({
    resolver: zodResolver(
      profileSchema.superRefine((values, ctx) => {
        const email = values.email.trim().toLowerCase();
        if (users?.some((user) => user.id !== userId && user.email.toLowerCase() === email)) {
          ctx.addIssue({ code: "custom", path: ["email"], message: "Email này đang được người dùng khác sử dụng." });
        }
      }),
    ),
    defaultValues: { name: session.name, email: session.email },
    mode: "onTouched",
  });
  const name = useWatch({ control: form.control, name: "name" });

  const onSubmit = async (values: ProfileValues) => {
    const next = { name: values.name.trim(), email: values.email.trim().toLowerCase() };
    if (userId) await update.mutateAsync({ id: userId, patch: next });
    signIn({ ...session, ...next });
    form.reset(next);
    toast.success("Đã cập nhật hồ sơ.", {
      description: "Tên mới hiển thị ở thanh bên và trong lịch sử xử lý đăng ký.",
    });
  };

  return (
    <Card>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle>Hồ sơ</CardTitle>
            <CardDescription>Tên hiển thị trong CMS và email đăng nhập.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
              <UserAvatar name={name || session.name} size="lg" />
              <p className="text-muted-foreground text-xs">
                Ảnh đại diện dùng chữ cái đầu của tên — màu được chọn tự động để dễ nhận ra bạn trong danh sách.
              </p>
            </div>
            <FieldRow>
              <TextField name="name" label="Họ tên" required />
              <TextField name="email" label="Email đăng nhập" type="email" required />
            </FieldRow>
            {!userId ? (
              <Alert>
                <AlertDescription>
                  Không tìm thấy tài khoản trong danh sách người dùng — chỉ phiên hiện tại được cập nhật.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="ghost" disabled={!form.formState.isDirty} onClick={() => form.reset()}>
              Hoàn tác
            </Button>
            <Button type="submit" disabled={!form.formState.isDirty || update.isPending}>
              {update.isPending ? <Spinner /> : null}
              Lưu hồ sơ
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Password (POST /api/admin/auth/password)

const PASSWORD_RULES: { label: string; test: (value: string, current: string) => boolean }[] = [
  { label: "Ít nhất 8 ký tự", test: (value) => value.length >= 8 },
  { label: "Có cả chữ và số", test: (value) => /[a-zA-Z]/.test(value) && /\d/.test(value) },
  { label: "Khác mật khẩu hiện tại", test: (value, current) => Boolean(value) && value !== current },
];

const passwordSchema = z
  .object({
    current: z.string().min(1, "Nhập mật khẩu hiện tại."),
    next: z.string().min(1, "Nhập mật khẩu mới."),
    confirm: z.string().min(1, "Nhập lại mật khẩu mới."),
  })
  .superRefine((values, ctx) => {
    const broken = PASSWORD_RULES.find((rule) => !rule.test(values.next, values.current));
    if (values.next && broken)
      ctx.addIssue({
        code: "custom",
        path: ["next"],
        message: `Mật khẩu mới chưa đạt: ${broken.label.toLowerCase()}.`,
      });
    if (values.confirm && values.confirm !== values.next) {
      ctx.addIssue({ code: "custom", path: ["confirm"], message: "Mật khẩu xác nhận không khớp." });
    }
  });
type PasswordValues = z.infer<typeof passwordSchema>;

function PasswordCard() {
  const [visible, setVisible] = useState(false);
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });
  const [current, next, confirm] = useWatch({ control: form.control, name: ["current", "next", "confirm"] });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: PasswordValues) => {
    try {
      await authApi.changePassword(values.current, values.next);
    } catch (failure) {
      form.setError("current", { message: failure instanceof Error ? failure.message : "Không đổi được mật khẩu." });
      return;
    }
    form.reset();
    toast.success("Đã đổi mật khẩu.", { description: "Dùng mật khẩu mới cho lần đăng nhập sau." });
  };

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="text-muted-foreground size-4" /> Đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Mật khẩu được mã hóa (scrypt) trên máy chủ — Hooked không xem được mật khẩu của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PasswordInput
            id="current-password"
            label="Mật khẩu hiện tại"
            autoComplete="current-password"
            visible={visible}
            onToggle={() => setVisible((value) => !value)}
            error={errors.current?.message}
            register={form.register("current")}
          />
          <FieldRow>
            <PasswordInput
              id="new-password"
              label="Mật khẩu mới"
              autoComplete="new-password"
              visible={visible}
              error={errors.next?.message}
              register={form.register("next")}
            />
            <PasswordInput
              id="confirm-password"
              label="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              visible={visible}
              error={errors.confirm?.message}
              register={form.register("confirm")}
            />
          </FieldRow>
          <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
            {[
              ...PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(next, current) })),
              { label: "Hai lần nhập khớp nhau", ok: Boolean(next) && next === confirm },
            ].map((rule) => (
              <li
                key={rule.label}
                className={cn("flex items-center gap-1.5", rule.ok ? "text-success" : "text-muted-foreground")}
              >
                {rule.ok ? <CircleCheck className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                {rule.label}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            Đổi mật khẩu
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Preferences

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Theo hệ thống", icon: Monitor },
];

const PRESET_NOTES: Record<ThemePreset, string> = {
  hooked: "Cam thương hiệu Hooked",
  tangerine: "Cam ấm, nền xanh xám",
  "soft-pop": "Tím pastel, bo tròn",
  brutalist: "Tương phản, góc vuông",
};

/** Primary button colour of each preset (light mode) — the swatch alone is the preset's identity colour. */
const PRESET_PRIMARY: Record<ThemePreset, string> = {
  hooked: "oklch(0.64 0.19 39)",
  tangerine: "oklch(0.64 0.17 36.44)",
  "soft-pop": "oklch(0.51 0.23 277)",
  brutalist: "oklch(0.65 0.237 27)",
};

const WIDTHS: { value: ContentWidth; label: string; note: string }[] = [
  { value: "centered", label: "Căn giữa", note: "Dễ đọc trên màn hình lớn" },
  { value: "full", label: "Toàn chiều rộng", note: "Tận dụng màn hình rộng cho bảng nhiều cột" },
];

function PreferencesCard() {
  const { mode, preset, contentWidth, setMode, setPreset, setContentWidth } = usePreferences();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Giao diện</CardTitle>
        <CardDescription>
          Áp dụng ngay và lưu trên trình duyệt này — không ảnh hưởng tới người dùng khác hay website.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <PreferenceGroup label="Chế độ hiển thị">
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((item) => (
              <OptionTile
                key={item.value}
                active={mode === item.value}
                onSelect={() => setMode(item.value)}
                label={item.label}
                icon={<item.icon />}
              >
                <ModePreview mode={item.value} />
              </OptionTile>
            ))}
          </div>
        </PreferenceGroup>

        <PreferenceGroup label="Màu chủ đạo">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {THEME_PRESETS.map((item) => (
              <OptionTile
                key={item.value}
                active={preset === item.value}
                onSelect={() => setPreset(item.value)}
                label={item.label}
                note={PRESET_NOTES[item.value]}
              >
                <div className="bg-background flex h-14 items-center gap-2 rounded-md border px-3">
                  <span
                    className="ring-foreground/15 size-7 shrink-0 rounded-full ring-1"
                    style={{ background: item.swatch }}
                  />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="h-1.5 w-full rounded-full bg-muted" />
                    <span className="h-3.5 w-12 rounded-sm" style={{ background: PRESET_PRIMARY[item.value] }} />
                  </span>
                </div>
              </OptionTile>
            ))}
          </div>
        </PreferenceGroup>

        <PreferenceGroup label="Độ rộng nội dung">
          <div className="grid gap-3 sm:grid-cols-2">
            {WIDTHS.map((item) => (
              <OptionTile
                key={item.value}
                active={contentWidth === item.value}
                onSelect={() => setContentWidth(item.value)}
                label={item.label}
                note={item.note}
              >
                <WidthPreview width={item.value} />
              </OptionTile>
            ))}
          </div>
        </PreferenceGroup>
      </CardContent>
    </Card>
  );
}

function PreferenceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2.5">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

function OptionTile({
  active,
  onSelect,
  label,
  note,
  icon,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  label: string;
  note?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "group focus-visible:ring-ring/50 relative flex flex-col gap-2.5 rounded-xl border p-2.5 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none",
        active ? "border-primary bg-primary/5 ring-primary ring-1" : "hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {children}
      <span className="flex items-start gap-1.5 px-0.5">
        {icon ? <span className="text-muted-foreground mt-0.5 hidden sm:inline [&_svg]:size-3.5">{icon}</span> : null}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{label}</span>
          {note ? <span className="text-muted-foreground block text-xs">{note}</span> : null}
        </span>
        <span
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
            active ? "border-primary bg-primary text-primary-foreground" : "bg-background",
          )}
        >
          {active ? <Check className="size-2.5" /> : null}
        </span>
      </span>
    </button>
  );
}

/** Miniature admin screen in light / dark (fixed colours: it must look the same whatever the current theme). */
function MiniScreen({ dark, className }: { dark: boolean; className?: string }) {
  return (
    <div className={cn("flex h-full w-full gap-1 p-1.5", dark ? "bg-[#1d1a18]" : "bg-[#fbfaf8]", className)}>
      <div className={cn("flex w-1/4 flex-col gap-1 rounded-sm p-1", dark ? "bg-[#26221f]" : "bg-[#f1eeea]")}>
        <span className="h-1 w-full rounded-full bg-[#e55624]" />
        <span className={cn("h-1 w-3/4 rounded-full", dark ? "bg-white/15" : "bg-black/10")} />
        <span className={cn("h-1 w-2/3 rounded-full", dark ? "bg-white/15" : "bg-black/10")} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className={cn("h-1.5 w-1/2 rounded-full", dark ? "bg-white/30" : "bg-black/20")} />
        <div
          className={cn("flex-1 rounded-sm border", dark ? "border-white/10 bg-[#2a2522]" : "border-black/5 bg-white")}
        />
      </div>
    </div>
  );
}

function ModePreview({ mode }: { mode: ThemeMode }) {
  return (
    <div className="relative h-16 overflow-hidden rounded-md border sm:h-20">
      {mode === "system" ? (
        <>
          <MiniScreen dark={false} className="absolute inset-0" />
          <MiniScreen dark className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        </>
      ) : (
        <MiniScreen dark={mode === "dark"} />
      )}
    </div>
  );
}

function WidthPreview({ width }: { width: ContentWidth }) {
  return (
    <div className="flex h-16 gap-1 overflow-hidden rounded-md border bg-muted/40 p-1.5">
      <div className="w-1/6 rounded-sm bg-muted" />
      <div className="border-border flex flex-1 justify-center rounded-sm border border-dashed px-1 py-1">
        <div
          className={cn(
            "bg-background flex flex-col gap-1 rounded-sm p-1 shadow-xs",
            width === "centered" ? "w-3/5" : "w-full",
          )}
        >
          <span className="bg-primary/60 h-1.5 w-1/3 rounded-full" />
          <span className="h-1 w-full rounded-full bg-muted" />
          <span className="h-1 w-4/5 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Demo data & session

function DemoDataCard() {
  const reset = useResetCms();
  const confirm = useConfirm();
  const isOwner = useAuth((state) => state.user?.role === "owner");

  const onReset = async () => {
    const ok = await confirm({
      title: "Khôi phục dữ liệu mẫu?",
      description:
        "Toàn bộ nội dung trong database (khóa học, học viên, dự án, bài viết, trang, đăng ký tư vấn…) bị thay bằng dữ liệu mẫu và website cập nhật ngay. Tài khoản người dùng được giữ nguyên. Không thể hoàn tác.",
      confirmLabel: "Khôi phục",
      destructive: true,
    });
    if (ok) reset.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="text-muted-foreground size-4" /> Dữ liệu
        </CardTitle>
        <CardDescription>Nội dung xuất hiện trên website ngay khi lưu.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
          <li className="flex gap-2">
            <Check className="text-success mt-0.5 size-4 shrink-0" />
            Nội dung ở trạng thái Nháp không hiển thị trên website.
          </li>
          <li className="flex gap-2">
            <Check className="text-success mt-0.5 size-4 shrink-0" />
            Khôi phục dữ liệu mẫu (chỉ Chủ sở hữu) đưa nội dung về như lúc cài đặt — dùng cho môi trường thử nghiệm.
          </li>
        </ul>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="text-muted-foreground text-xs">
          {isOwner ? "Chỉ nên dùng trên môi trường thử nghiệm." : "Chỉ Chủ sở hữu được khôi phục dữ liệu."}
        </span>
        <Button variant="destructive" onClick={onReset} disabled={reset.isPending || !isOwner}>
          {reset.isPending ? <Spinner /> : <RotateCcw />}
          Khôi phục dữ liệu mẫu
        </Button>
      </CardFooter>
    </Card>
  );
}

function SessionCard() {
  const router = useRouter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Phiên đăng nhập</CardTitle>
        <CardDescription>Đăng nhập được giữ 30 ngày nếu chọn “Ghi nhớ đăng nhập”, ngược lại 12 giờ.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3 text-sm">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Monitor className="text-muted-foreground size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">Trình duyệt hiện tại</span>
          <span className="text-muted-foreground block text-xs">Đang hoạt động</span>
        </span>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          variant="outline"
          onClick={async () => {
            await logout();
            router.replace("/admin/login");
          }}
        >
          <LogOut /> Đăng xuất
        </Button>
      </CardFooter>
    </Card>
  );
}
