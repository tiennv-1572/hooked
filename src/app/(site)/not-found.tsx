import type { Metadata } from "next";

import { StatusScreen } from "@/components/layout/status-screen";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="Trang này không tồn tại"
      description="Đường dẫn có thể đã thay đổi hoặc trang đã được gỡ. Hãy quay lại trang chủ hoặc chọn một mục bên dưới."
      actions={
        <>
          <ButtonLink href={routes.home} variant="accent" className="w-[200px]">
            Về trang chủ
            <Icon name="arrow-up-right-dark-20" />
          </ButtonLink>
          <ButtonLink href={routes.academy} variant="coal" className="w-[200px]">
            Khám phá Academy
            <Icon name="arrow-up-right-accent-20" />
          </ButtonLink>
        </>
      }
    />
  );
}
