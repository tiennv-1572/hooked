"use client";

import { useEffect } from "react";

import { StatusScreen } from "@/components/layout/status-screen";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/site";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="Oops"
      title="Đã có lỗi xảy ra"
      description="Trang chưa tải được. Bạn thử tải lại, nếu vẫn lỗi hãy liên hệ Hooked qua hooked.vie@gmail.com."
      actions={
        <>
          <Button variant="accent" className="w-[200px]" onClick={() => retry()}>
            Thử lại
            <Icon name="arrow-up-right-dark-20" />
          </Button>
          <ButtonLink href={routes.home} variant="coal" className="w-[200px]">
            Về trang chủ
            <Icon name="arrow-up-right-accent-20" />
          </ButtonLink>
        </>
      }
    />
  );
}
