"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { HookedMark } from "@/admin/components/shell/admin-sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/admin/components/ui/alert";
import { Button } from "@/admin/components/ui/button";
import { Checkbox } from "@/admin/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Spinner } from "@/admin/components/ui/spinner";
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from "@/admin/lib/auth";
import { authApi } from "@/admin/lib/cms/http-adapter";

const schema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

const SHOW_DEMO = process.env.NODE_ENV !== "production";

/** Sign-in against POST /api/admin/auth/login (sets the httpOnly session cookie). */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const signIn = useAuth((state) => state.signIn);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = params.get("next") || "/admin";

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: SHOW_DEMO
      ? { email: DEMO_EMAIL, password: DEMO_PASSWORD, remember: true }
      : { email: "", password: "", remember: true },
  });

  // Already signed in (valid cookie) → straight to the panel. The cached profile alone is not trusted here.
  useEffect(() => {
    let cancelled = false;
    authApi.me().then((current) => {
      if (cancelled || !current) return;
      signIn(current);
      router.replace(next);
    });
    return () => {
      cancelled = true;
    };
  }, [next, router, signIn]);

  const onSubmit = async (values: Values) => {
    setError(null);
    try {
      signIn(await authApi.login(values.email, values.password, values.remember));
      router.replace(next);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không đăng nhập được.");
    }
  };

  const remember = useWatch({ control: form.control, name: "remember" });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      <div className="flex items-center gap-2.5">
        <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
          <HookedMark className="h-3.5 w-6" />
        </span>
        <span className="leading-tight">
          <span className="font-brand block text-sm font-extrabold tracking-wide">HOOKED</span>
          <span className="text-muted-foreground block text-xs">Content Studio</span>
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-muted-foreground mt-1 text-sm">Quản trị nội dung website Hooked Entertainment.</p>
      </div>

      {SHOW_DEMO ? (
        <Alert>
          <Info />
          <AlertTitle>Tài khoản mặc định (môi trường dev)</AlertTitle>
          <AlertDescription>
            {DEMO_EMAIL} / {DEMO_PASSWORD} — tạo bởi <code>pnpm db:seed</code>. Đổi mật khẩu ở Tài khoản của tôi.
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>
        <Field data-invalid={errors.password ? true : undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={() => setError("Liên hệ quản trị viên để đặt lại mật khẩu.")}
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-9"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={remember} onCheckedChange={(value) => form.setValue("remember", Boolean(value))} />
          Ghi nhớ đăng nhập
        </label>
        {error ? <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">{error}</p> : null}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Đăng nhập
        </Button>
      </form>

      <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} Hooked Entertainment</p>
    </div>
  );
}
