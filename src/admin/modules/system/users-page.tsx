"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Copy,
  Info,
  KeyRound,
  Lock,
  LockOpen,
  MailPlus,
  Minus,
  Pencil,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { DataTable, RowActions, SortHeader, type RowAction } from "@/admin/components/cms/data-table";
import { TextField } from "@/admin/components/cms/form-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { StatusPill } from "@/admin/components/cms/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/admin/components/ui/alert";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/admin/components/ui/sheet";
import { Spinner } from "@/admin/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/admin/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/admin/components/ui/tooltip";
import { useIsMobile } from "@/admin/hooks/use-mobile";
import { useAuth } from "@/admin/lib/auth";
import { useCollection, useCreateItem, useDeleteItems, useUpdateItem } from "@/admin/lib/cms/hooks";
import type { NewItem } from "@/admin/lib/cms/registry";
import type { AdminRole, AdminUser } from "@/admin/lib/cms/types/shared";
import { formatDate, formatRelative } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { PasswordInput } from "./password-input";
import {
  PERMISSIONS,
  ROLE_META,
  ROLE_ORDER,
  RoleBadge,
  STATUS_META,
  UserAvatar,
  type Permission,
  type UserStatus,
} from "./roles";

type Guards = {
  isSelf: boolean;
  isLastOwner: boolean;
  canManage: boolean;
  /** Set this user's password: same level or lower (owner → anyone, admin → admins and editors), never yourself. */
  canSetPassword: boolean;
  /** Role / status / delete are locked (self, last owner, or not allowed). */
  locked: boolean;
  lockReason?: string;
};

function guardsFor(target: AdminUser, users: AdminUser[], meId: string | undefined, myRole: AdminRole): Guards {
  const isSelf = target.id === meId;
  const activeOwners = users.filter((user) => user.role === "owner" && user.status === "active").length;
  const isLastOwner = target.role === "owner" && target.status === "active" && activeOwners <= 1;
  const canManage = myRole === "owner" || (myRole === "admin" && target.role !== "owner");
  const lockReason = isSelf
    ? "Bạn không thể tự đổi vai trò, khóa hoặc xóa tài khoản của chính mình."
    : isLastOwner
      ? "Đây là chủ sở hữu duy nhất — cần ít nhất một chủ sở hữu đang hoạt động."
      : !canManage
        ? myRole === "editor"
          ? "Biên tập viên không quản lý được người dùng."
          : "Chỉ chủ sở hữu mới thay đổi được chủ sở hữu khác."
        : undefined;
  const canSetPassword = canManage && !isSelf;
  return { isSelf, isLastOwner, canManage, canSetPassword, locked: Boolean(lockReason), lockReason };
}

/** Roles the current user may assign. */
const assignableRoles = (myRole: AdminRole): AdminRole[] =>
  myRole === "owner" ? ROLE_ORDER : myRole === "admin" ? ["admin", "editor"] : [];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Users & roles: team table with inline role changes, invite dialog, edit sheet, role legend and permissions matrix. */
export function UsersPage() {
  const { data, isLoading } = useCollection("users");
  const session = useAuth((state) => state.user);
  const signIn = useAuth((state) => state.signIn);
  const update = useUpdateItem("users", { silent: true });
  const remove = useDeleteItems("users", { silent: true });
  const confirm = useConfirm();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [passwordFor, setPasswordFor] = useState<AdminUser | null>(null);
  const isMobile = useIsMobile();

  const users = useMemo(() => data ?? [], [data]);
  const me = users.find((user) => user.id === session?.id) ?? users.find((user) => user.email === session?.email);
  const myRole: AdminRole = me?.role ?? session?.role ?? "editor";
  const canInvite = myRole !== "editor";
  const editing = users.find((user) => user.id === editingId) ?? null;

  const counts = {
    active: users.filter((user) => user.status === "active").length,
    invited: users.filter((user) => user.status === "invited").length,
  };

  const setStatus = async (user: AdminUser, status: UserStatus) => {
    if (status === "disabled") {
      const ok = await confirm({
        title: `Khóa tài khoản của ${user.name}?`,
        description:
          "Người dùng sẽ không đăng nhập được vào CMS cho tới khi được mở khóa. Nội dung họ đã tạo vẫn giữ nguyên.",
        confirmLabel: "Khóa tài khoản",
        destructive: true,
      });
      if (!ok) return;
    }
    await update.mutateAsync({ id: user.id, patch: { status } });
    toast.success(
      status === "disabled"
        ? `Đã khóa tài khoản ${user.name}.`
        : user.status === "invited"
          ? `Đã kích hoạt tài khoản ${user.name}.`
          : `Đã mở khóa tài khoản ${user.name}.`,
    );
  };

  const changeRole = async (user: AdminUser, role: AdminRole) => {
    if (role === user.role) return;
    if (role === "owner") {
      const ok = await confirm({
        title: `Chỉ định ${user.name} làm chủ sở hữu?`,
        description: "Chủ sở hữu có toàn quyền với CMS, kể cả phân quyền và xóa người dùng khác.",
        confirmLabel: "Chỉ định",
      });
      if (!ok) return;
    }
    await update.mutateAsync({ id: user.id, patch: { role } });
    toast.success(`${user.name} giờ là ${ROLE_META[role].label}.`);
  };

  const askDelete = async (user: AdminUser) => {
    const ok = await confirm({
      title: `Xóa người dùng ${user.name}?`,
      description: `${user.email} sẽ mất quyền truy cập CMS ngay lập tức. Hành động không thể hoàn tác — nếu chỉ muốn tạm ngừng, hãy khóa tài khoản.`,
      confirmLabel: "Xóa người dùng",
      destructive: true,
    });
    if (!ok) return;
    await remove.mutateAsync([user.id]);
    toast.success(`Đã xóa ${user.name}.`);
    setEditingId(null);
  };

  // No email delivery: a fresh temporary password is set and shown once so it can be handed over.
  const resendInvite = async (user: AdminUser) => {
    const password = temporaryPassword();
    await update.mutateAsync({ id: user.id, patch: { password } as Partial<AdminUser> });
    announceCredentials(`Mật khẩu tạm mới cho ${user.name}`, user.email, password);
  };

  const columns: ColumnDef<AdminUser, unknown>[] = [
    {
      accessorKey: "name",
      meta: { label: "Người dùng" },
      header: ({ column }) => <SortHeader column={column} title="Người dùng" />,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <button
            type="button"
            onClick={() => setEditingId(user.id)}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <UserAvatar name={user.name} className={cn(user.status === "disabled" && "opacity-50")} />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="truncate font-medium hover:underline">{user.name}</span>
                {user.id === me?.id ? (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    Bạn
                  </Badge>
                ) : null}
              </span>
              <span className="text-muted-foreground block truncate text-xs">{user.email}</span>
              {isMobile ? (
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <RoleBadge role={user.role} />
                  <StatusPill tone={STATUS_META[user.status].tone}>{STATUS_META[user.status].label}</StatusPill>
                </span>
              ) : null}
            </span>
          </button>
        );
      },
    },
    {
      accessorKey: "role",
      meta: { label: "Vai trò" },
      header: ({ column }) => <SortHeader column={column} title="Vai trò" />,
      sortingFn: (a, b) => ROLE_ORDER.indexOf(a.original.role) - ROLE_ORDER.indexOf(b.original.role),
      cell: ({ row }) => {
        const user = row.original;
        const guards = guardsFor(user, users, me?.id, myRole);
        if (guards.locked) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5" tabIndex={0}>
                  <RoleBadge role={user.role} />
                  <Lock className="text-muted-foreground size-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">{guards.lockReason}</TooltipContent>
            </Tooltip>
          );
        }
        return (
          <Select value={user.role} onValueChange={(value) => changeRole(user, value as AdminRole)}>
            <SelectTrigger
              size="sm"
              className="-ml-1.5 gap-1 border-transparent bg-transparent px-1.5 shadow-none hover:bg-muted dark:bg-transparent dark:hover:bg-muted"
              aria-label={`Vai trò của ${user.name} — bấm để đổi`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles(myRole).map((role) => (
                <SelectItem key={role} value={role}>
                  <RoleBadge role={role} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "status",
      meta: { label: "Trạng thái" },
      header: "Trạng thái",
      enableSorting: false,
      cell: ({ row }) => (
        <StatusPill tone={STATUS_META[row.original.status].tone}>{STATUS_META[row.original.status].label}</StatusPill>
      ),
    },
    {
      id: "lastActiveAt",
      accessorFn: (row) => row.lastActiveAt ?? "",
      meta: { label: "Hoạt động" },
      header: ({ column }) => <SortHeader column={column} title="Hoạt động" />,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span className="text-muted-foreground text-sm">
            {user.lastActiveAt
              ? formatRelative(user.lastActiveAt)
              : user.status === "invited"
                ? `Mời ${formatRelative(user.createdAt)}`
                : "Chưa đăng nhập"}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      size: 48,
      cell: ({ row }) => {
        const user = row.original;
        const guards = guardsFor(user, users, me?.id, myRole);
        const actions: RowAction[] = [];
        if (guards.isSelf) actions.push({ label: "Tài khoản của tôi", icon: <UserRound />, href: "/admin/account" });
        if (guards.canManage || guards.isSelf) {
          actions.push({ label: "Chỉnh sửa", icon: <Pencil />, onSelect: () => setEditingId(user.id) });
        }
        if (guards.canSetPassword && user.status !== "invited") {
          actions.push({ label: "Đổi mật khẩu", icon: <KeyRound />, onSelect: () => setPasswordFor(user) });
        }
        if (guards.canManage && user.status === "invited") {
          actions.push({ label: "Tạo mật khẩu tạm mới", icon: <KeyRound />, onSelect: () => resendInvite(user) });
          actions.push({ label: "Kích hoạt thủ công", icon: <UserCheck />, onSelect: () => setStatus(user, "active") });
        }
        if (!guards.locked && user.status === "active") {
          actions.push({ label: "Khóa tài khoản", icon: <Lock />, onSelect: () => setStatus(user, "disabled") });
        }
        if (!guards.locked && user.status === "disabled") {
          actions.push({ label: "Mở khóa", icon: <LockOpen />, onSelect: () => setStatus(user, "active") });
        }
        if (!guards.locked) {
          actions.push({
            label: "Xóa",
            icon: <Trash2 />,
            destructive: true,
            separatorBefore: true,
            onSelect: () => askDelete(user),
          });
        }
        if (!actions.length) {
          actions.push({ label: "Xem thông tin", icon: <UserRound />, onSelect: () => setEditingId(user.id) });
        }
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Người dùng & phân quyền"
        description={
          isLoading
            ? "Thành viên có quyền truy cập CMS."
            : `${users.length} thành viên · ${counts.active} đang hoạt động${counts.invited ? ` · ${counts.invited} lời mời đang chờ` : ""}.`
        }
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Người dùng" }]}
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)} disabled={!canInvite}>
            <MailPlus /> Mời người dùng
          </Button>
        }
      />

      {!isLoading && !canInvite ? (
        <Alert>
          <Info />
          <AlertTitle>Bạn đang xem với quyền Biên tập</AlertTitle>
          <AlertDescription>
            Chỉ Chủ sở hữu và Quản trị viên mới mời hoặc thay đổi quyền của người dùng.
          </AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        // Remount when crossing the breakpoint so the mobile column set applies (role + status move under the name;
        // the role is then changed from the edit sheet).
        key={isMobile ? "mobile" : "desktop"}
        initialHidden={isMobile ? ["role", "status", "lastActiveAt"] : []}
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchKeys={["name", "email"]}
        searchPlaceholder="Tìm theo tên, email…"
        initialSorting={[{ id: "role", desc: false }]}
        filters={[
          {
            columnId: "role",
            title: "Vai trò",
            options: ROLE_ORDER.map((role) => ({ value: role, label: ROLE_META[role].label })),
          },
          {
            columnId: "status",
            title: "Trạng thái",
            options: (Object.keys(STATUS_META) as UserStatus[]).map((status) => ({
              value: status,
              label: STATUS_META[status].label,
            })),
          },
        ]}
        emptyState={{
          title: "Chưa có người dùng",
          description: "Mời thành viên đầu tiên của nhóm.",
          icon: <UserCog />,
          action: canInvite ? (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <MailPlus /> Mời người dùng
            </Button>
          ) : undefined,
        }}
      />

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <RolesLegend users={users} className="lg:col-span-2" />
        <PermissionsMatrix className="lg:col-span-3" />
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} users={users} roles={assignableRoles(myRole)} />
      <SetPasswordDialog user={passwordFor} onClose={() => setPasswordFor(null)} />
      <UserSheet
        user={editing}
        users={users}
        guards={editing ? guardsFor(editing, users, me?.id, myRole) : null}
        roles={assignableRoles(myRole)}
        onClose={() => setEditingId(null)}
        onResend={resendInvite}
        onDelete={askDelete}
        onSaved={(saved) => {
          if (saved.id === me?.id && session)
            signIn({ ...session, name: saved.name, email: saved.email, role: saved.role });
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

function RolePicker({
  value,
  onChange,
  roles,
  disabled,
  name,
}: {
  value: AdminRole;
  onChange: (role: AdminRole) => void;
  roles: AdminRole[];
  disabled?: boolean;
  name: string;
}) {
  const options = disabled ? [value] : ROLE_ORDER.filter((role) => roles.includes(role) || role === value);
  return (
    <div role="radiogroup" aria-label="Vai trò" className="grid gap-2">
      {options.map((role) => {
        const meta = ROLE_META[role];
        const active = value === role;
        const allowed = roles.includes(role);
        return (
          <button
            key={role}
            id={`${name}-${role}`}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled || !allowed}
            onClick={() => onChange(role)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed",
              active ? "border-primary bg-primary/5 ring-primary ring-1" : "hover:bg-muted/50",
              !active && !allowed && "opacity-50",
            )}
          >
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", meta.tone)}>
              <meta.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{meta.label}</span>
              <span className="text-muted-foreground block text-xs">{meta.description}</span>
            </span>
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                active && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {active ? <Check className="size-3" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const baseSchema = z.object({
  name: z.string().trim().min(2, "Nhập họ tên (ít nhất 2 ký tự).").max(60, "Tối đa 60 ký tự."),
  email: z.email("Email không hợp lệ."),
  role: z.enum(["owner", "admin", "editor"]),
});

const inviteSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, "Mật khẩu tạm tối thiểu 8 ký tự.")
    .regex(/[A-Za-z]/, "Mật khẩu tạm cần có chữ.")
    .regex(/\d/, "Mật khẩu tạm cần có số."),
});

/** Readable temporary password (no 0/O, 1/l): `hooked-` + 4 letters + 4 digits. */
function temporaryPassword() {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const random = crypto.getRandomValues(new Uint32Array(8));
  const part = (from: number, alphabet: string) =>
    Array.from(random.slice(from, from + 4), (value) => alphabet[value % alphabet.length]).join("");
  return `hooked-${part(0, letters)}${part(4, "23456789")}`;
}

/** Long-lived toast with the credentials and a copy button (shown once — the server only keeps a hash). */
function announceCredentials(title: string, email: string, password: string) {
  toast.success(title, {
    description: `${email} · mật khẩu tạm: ${password} — tài khoản kích hoạt ở lần đăng nhập đầu tiên.`,
    duration: 60_000,
    action: {
      label: "Sao chép",
      onClick: () => void navigator.clipboard?.writeText(`Email: ${email}\nMật khẩu tạm: ${password}`),
    },
  });
}

function uniqueEmail(users: AdminUser[], exceptId?: string) {
  return (values: { email: string }, ctx: z.RefinementCtx) => {
    const email = normalizeEmail(values.email);
    if (users.some((user) => user.id !== exceptId && normalizeEmail(user.email) === email)) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Email này đã có trong danh sách người dùng." });
    }
  };
}

function InviteDialog({
  open,
  onOpenChange,
  users,
  roles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: AdminUser[];
  roles: AdminRole[];
}) {
  const create = useCreateItem("users", { silent: true });
  const schema = useMemo(() => inviteSchema.superRefine(uniqueEmail(users)), [users]);
  type Values = z.infer<typeof inviteSchema>;
  const blank = (): Values => ({ name: "", email: "", role: "editor", password: temporaryPassword() });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: blank(),
    mode: "onTouched",
  });

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) form.reset(blank());
  };

  const onSubmit = async (values: Values) => {
    const email = normalizeEmail(values.email);
    // `password` is write-only: the API hashes it and never returns it.
    await create.mutateAsync({
      name: values.name.trim(),
      email,
      role: values.role,
      status: "invited",
      password: values.password,
    } as NewItem<"users">);
    announceCredentials(`Đã tạo tài khoản cho ${values.name.trim()}`, email, values.password);
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Mời người dùng</DialogTitle>
              <DialogDescription>
                Tạo tài khoản với mật khẩu tạm rồi gửi cho người được mời. Tài khoản ở trạng thái “Đã mời” cho tới lần
                đăng nhập đầu tiên.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="name" label="Họ tên" required placeholder="Nguyễn Văn A" autoFocus />
              <TextField name="email" label="Email" type="email" required placeholder="ten@hooked.vn" />
            </div>
            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.error ? true : undefined}>
                  <FieldLabel htmlFor="invite-role-editor">Vai trò</FieldLabel>
                  <RolePicker name="invite-role" value={field.value} onChange={field.onChange} roles={roles} />
                  <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.error ? true : undefined}>
                  <FieldLabel htmlFor="invite-password">Mật khẩu tạm</FieldLabel>
                  <div className="flex gap-2">
                    <Input id="invite-password" autoComplete="off" className="font-mono" {...field} />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Tạo mật khẩu khác"
                          onClick={() => form.setValue("password", temporaryPassword(), { shouldValidate: true })}
                        >
                          <RefreshCw />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Tạo mật khẩu khác</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Sao chép mật khẩu"
                          onClick={() => {
                            void navigator.clipboard?.writeText(field.value);
                            toast.success("Đã sao chép mật khẩu tạm.");
                          }}
                        >
                          <Copy />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sao chép</TooltipContent>
                    </Tooltip>
                  </div>
                  <FieldDescription>
                    Người dùng nên đổi mật khẩu ở “Tài khoản của tôi” sau khi đăng nhập.
                  </FieldDescription>
                  <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                </Field>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? <Spinner /> : <Send />}
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Change another user's password (PATCH users/{id} with the write-only `password`; the server checks the roles)

const NEW_PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "Ít nhất 8 ký tự", test: (value) => value.length >= 8 },
  { label: "Có cả chữ và số", test: (value) => /[a-zA-Z]/.test(value) && /\d/.test(value) },
];

const setPasswordSchema = z
  .object({
    next: z.string().min(1, "Nhập mật khẩu mới."),
    confirm: z.string().min(1, "Nhập lại mật khẩu mới."),
  })
  .superRefine((values, ctx) => {
    const broken = NEW_PASSWORD_RULES.find((rule) => !rule.test(values.next));
    if (values.next && broken) {
      ctx.addIssue({ code: "custom", path: ["next"], message: `Mật khẩu chưa đạt: ${broken.label.toLowerCase()}.` });
    }
    if (values.confirm && values.confirm !== values.next) {
      ctx.addIssue({ code: "custom", path: ["confirm"], message: "Mật khẩu xác nhận không khớp." });
    }
  });
type SetPasswordValues = z.infer<typeof setPasswordSchema>;

function SetPasswordDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const update = useUpdateItem("users", { silent: true });
  const [visible, setVisible] = useState(false);
  const form = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { next: "", confirm: "" },
  });
  const [next, confirm] = useWatch({ control: form.control, name: ["next", "confirm"] });
  const { errors } = form.formState;

  const close = () => {
    onClose();
    form.reset();
    setVisible(false);
  };

  const generate = () => {
    const password = temporaryPassword();
    form.setValue("next", password, { shouldDirty: true });
    form.setValue("confirm", password, { shouldDirty: true });
    // Always valid: drop errors left by an earlier attempt.
    form.clearErrors();
    setVisible(true);
  };

  const onSubmit = async ({ next: password }: SetPasswordValues) => {
    if (!user) return;
    try {
      await update.mutateAsync({ id: user.id, patch: { password } as Partial<AdminUser> });
    } catch (failure) {
      form.setError("next", { message: failure instanceof Error ? failure.message : "Không đổi được mật khẩu." });
      return;
    }
    // Shown once: the server only keeps a hash.
    toast.success(`Đã đổi mật khẩu cho ${user.name}.`, {
      description: `${user.email} · mật khẩu mới: ${password} — gửi riêng cho người dùng.`,
      duration: 60_000,
      action: {
        label: "Sao chép",
        onClick: () => void navigator.clipboard?.writeText(`Email: ${user.email}\nMật khẩu: ${password}`),
      },
    });
    close();
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Đặt mật khẩu mới cho {user?.name} ({user?.email}). Mật khẩu cũ hết hiệu lực ngay; người dùng nên tự đổi
              lại ở “Tài khoản của tôi” sau khi đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <PasswordInput
              id="set-password"
              label="Mật khẩu mới"
              autoComplete="new-password"
              visible={visible}
              onToggle={() => setVisible((value) => !value)}
              error={errors.next?.message}
              register={form.register("next")}
            />
            <PasswordInput
              id="set-password-confirm"
              label="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              visible={visible}
              error={errors.confirm?.message}
              register={form.register("confirm")}
            />
            <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
              {[
                ...NEW_PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(next) })),
                { label: "Hai lần nhập khớp nhau", ok: Boolean(next) && next === confirm },
              ].map((rule) => (
                <li
                  key={rule.label}
                  className={cn("flex items-center gap-1.5", rule.ok ? "text-success" : "text-muted-foreground")}
                >
                  {rule.ok ? <Check className="size-3.5" /> : <Minus className="size-3.5" />}
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" onClick={generate}>
              <RefreshCw /> Tạo ngẫu nhiên
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={close}>
                Hủy
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? <Spinner /> : <KeyRound />}
                Đổi mật khẩu
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const editSchema = baseSchema.extend({ status: z.enum(["active", "invited", "disabled"]) });
type EditValues = z.infer<typeof editSchema>;

function UserSheet({
  user,
  users,
  guards,
  roles,
  onClose,
  onResend,
  onDelete,
  onSaved,
}: {
  user: AdminUser | null;
  users: AdminUser[];
  guards: Guards | null;
  roles: AdminRole[];
  onClose: () => void;
  onResend: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onSaved: (user: AdminUser) => void;
}) {
  return (
    <Sheet open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {user && guards ? (
          <UserSheetForm
            key={user.id}
            user={user}
            users={users}
            guards={guards}
            roles={roles}
            onClose={onClose}
            onResend={onResend}
            onDelete={onDelete}
            onSaved={onSaved}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function UserSheetForm({
  user,
  users,
  guards,
  roles,
  onClose,
  onResend,
  onDelete,
  onSaved,
}: {
  user: AdminUser;
  users: AdminUser[];
  guards: Guards;
  roles: AdminRole[];
  onClose: () => void;
  onResend: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onSaved: (user: AdminUser) => void;
}) {
  const update = useUpdateItem("users", { silent: true });
  const schema = useMemo(() => editSchema.superRefine(uniqueEmail(users, user.id)), [users, user.id]);
  const form = useForm<EditValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, email: user.email, role: user.role, status: user.status },
    mode: "onTouched",
  });
  const canEditProfile = guards.canManage || guards.isSelf;

  const onSubmit = async (values: EditValues) => {
    const saved = await update.mutateAsync({
      id: user.id,
      patch: {
        name: values.name.trim(),
        email: normalizeEmail(values.email),
        ...(guards.locked ? {} : { role: values.role, status: values.status }),
      },
    });
    toast.success(`Đã lưu thông tin ${saved.name}.`);
    onSaved(saved);
    onClose();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex h-full min-h-0 flex-col">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-3 pr-8">
            <UserAvatar name={user.name} size="lg" />
            <div className="min-w-0">
              <SheetTitle className="truncate">{user.name}</SheetTitle>
              <SheetDescription className="truncate">{user.email}</SheetDescription>
            </div>
          </div>
          <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>Tham gia {formatDate(user.createdAt)}</span>
            <span>
              Hoạt động:{" "}
              {user.lastActiveAt
                ? formatRelative(user.lastActiveAt)
                : user.status === "invited"
                  ? "chưa kích hoạt"
                  : "chưa đăng nhập"}
            </span>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
          {guards.lockReason ? (
            <Alert>
              <ShieldCheck />
              <AlertDescription>{guards.lockReason}</AlertDescription>
            </Alert>
          ) : null}

          <fieldset disabled={!canEditProfile} className="flex flex-col gap-4">
            <TextField name="name" label="Họ tên" required />
            <TextField name="email" label="Email đăng nhập" type="email" required />
          </fieldset>

          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={`edit-role-${field.value}`}>Vai trò</FieldLabel>
                <RolePicker
                  name="edit-role"
                  value={field.value}
                  onChange={field.onChange}
                  roles={roles}
                  disabled={guards.locked}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="edit-status">Trạng thái</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={guards.locked}>
                  <SelectTrigger id="edit-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_META) as UserStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {field.value === "invited"
                    ? "Đang chờ người dùng chấp nhận lời mời qua email."
                    : field.value === "disabled"
                      ? "Không thể đăng nhập cho tới khi được mở khóa."
                      : "Có thể đăng nhập và làm việc theo vai trò."}
                </FieldDescription>
              </Field>
            )}
          />

          {user.status === "invited" && guards.canManage ? (
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onResend(user)}>
              <KeyRound /> Tạo mật khẩu tạm mới
            </Button>
          ) : null}
        </div>

        <SheetFooter className="flex-row items-center border-t">
          {!guards.locked ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(user)}
            >
              <Trash2 /> Xóa
            </Button>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={update.isPending || !canEditProfile || !form.formState.isDirty}>
              {update.isPending ? <Spinner /> : null}
              Lưu thay đổi
            </Button>
          </div>
        </SheetFooter>
      </form>
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------

function RolesLegend({ users, className }: { users: AdminUser[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Vai trò</CardTitle>
        <CardDescription>Mỗi người dùng có một vai trò quyết định những gì họ được làm.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {ROLE_ORDER.map((role) => {
          const meta = ROLE_META[role];
          const count = users.filter((user) => user.role === role).length;
          return (
            <div key={role} className="flex gap-3">
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                <meta.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {meta.label}
                  <span className="text-muted-foreground text-xs font-normal">{count} người</span>
                </p>
                <p className="text-muted-foreground text-sm">{meta.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function PermissionCell({ value }: { value: Permission }) {
  if (value === true) {
    return (
      <span
        className="bg-success/12 text-success inline-flex size-6 items-center justify-center rounded-full"
        aria-label="Có"
      >
        <Check className="size-3.5" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="text-muted-foreground/60 inline-flex size-6 items-center justify-center" aria-label="Không">
        <Minus className="size-3.5" />
      </span>
    );
  }
  return <span className="text-muted-foreground text-xs leading-tight">{value}</span>;
}

function PermissionsMatrix({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader>
        <CardTitle>Ma trận phân quyền</CardTitle>
        <CardDescription>
          Quản lý người dùng và khôi phục dữ liệu được máy chủ kiểm tra theo vai trò; các quyền còn lại áp dụng trong
          CMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <MobilePermissions />
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Quyền</TableHead>
                {ROLE_ORDER.map((role) => (
                  <TableHead key={role} className="w-24 text-center last:pr-4">
                    {ROLE_META[role].label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map((group) => (
                <PermissionGroup key={group.group} group={group} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/** Below `sm` the 4-column matrix is too narrow: one block per permission with the three roles underneath. */
function MobilePermissions() {
  return (
    <div className="flex flex-col sm:hidden">
      {PERMISSIONS.map((group) => (
        <div key={group.group}>
          <p className="text-muted-foreground border-y bg-muted/40 px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
            {group.group}
          </p>
          <ul className="divide-y">
            {group.rows.map((row) => (
              <li key={row.label} className="flex flex-col gap-2 px-4 py-3">
                <span className="text-sm">{row.label}</span>
                <span className="grid grid-cols-3 gap-2">
                  {ROLE_ORDER.map((role) => (
                    <span key={role} className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      {typeof row[role] === "string" ? null : <PermissionCell value={row[role]} />}
                      <span className="leading-tight">
                        {ROLE_META[role].label}
                        {typeof row[role] === "string" ? (
                          <span className="text-foreground block">{row[role]}</span>
                        ) : null}
                      </span>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PermissionGroup({ group }: { group: (typeof PERMISSIONS)[number] }) {
  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableCell
          colSpan={4}
          className="text-muted-foreground py-1.5 pl-4 text-xs font-medium tracking-wide uppercase"
        >
          {group.group}
        </TableCell>
      </TableRow>
      {group.rows.map((row) => (
        <TableRow key={row.label} className="hover:bg-transparent">
          <TableCell className="pl-4 whitespace-normal">{row.label}</TableCell>
          {ROLE_ORDER.map((role) => (
            <TableCell key={role} className="text-center whitespace-normal last:pr-4">
              <PermissionCell value={row[role]} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
