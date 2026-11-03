import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/admin/components/shell/login-form";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,1.1fr)]">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <div className="relative hidden overflow-hidden bg-[#050101] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/photos/crowd-smoke.png"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050101] via-[#050101]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/hooked-logo.png" alt="Hooked" className="mb-6 h-auto w-40" />
          <p className="font-brand max-w-md text-3xl leading-tight font-extrabold uppercase">Support local artists.</p>
          <p className="mt-3 max-w-md text-sm text-white/70">
            Quản lý khóa học, học viên, dự án, bài viết và toàn bộ nội dung website Hooked Entertainment tại một nơi.
          </p>
        </div>
      </div>
    </div>
  );
}
