"use client";

import { ArrowUpRight, AtSign, MapPin, Phone, Share2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { FieldRow, FormSection, TextField } from "@/admin/components/cms/form-fields";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import { Button } from "@/admin/components/ui/button";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { useSingleton } from "@/admin/lib/cms/hooks";
import { contactSchema } from "./site-schemas";

/** `/admin/pages/contact` — page copy; the contact details themselves live in the site settings. */
export function ContactPageEditor() {
  const editor = useSingletonEditor("contactPage", contactSchema);
  return (
    <SingletonEditor editor={editor} title="Trang Contact">
      <FormSection title="Tiêu đề">
        <FieldRow>
          <TextField name="eyebrow" label="Dòng nhãn" required placeholder="CONTACT HOOKED" />
          <TextField name="title" label="Tiêu đề" required placeholder="Liên hệ Hooked." />
        </FieldRow>
      </FormSection>
      <ContactDetails />
    </SingletonEditor>
  );
}

/** Read-only summary of the contact data coming from the site settings. */
function ContactDetails() {
  const { data: settings, isLoading } = useSingleton("settings");
  const rows: { icon: ReactNode; label: string; value: ReactNode }[] = settings
    ? [
        { icon: <AtSign />, label: "Email", value: settings.company.email },
        { icon: <Phone />, label: "Điện thoại", value: settings.company.phoneDisplay },
        {
          icon: <MapPin />,
          label: "Địa chỉ",
          value: (
            <>
              <span className="block font-medium">{settings.company.legalName}</span>
              {settings.company.address}
            </>
          ),
        },
        {
          icon: <Share2 />,
          label: "Mạng xã hội",
          value: settings.socials.length ? settings.socials.map((social) => social.label).join(" · ") : "Chưa có",
        },
      ]
    : [];
  return (
    <FormSection
      title="Thông tin liên hệ"
      description="Dùng chung với footer — chỉnh một lần trong Cài đặt website."
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/settings">
            Sửa trong Cài đặt <ArrowUpRight />
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <dl className="divide-y rounded-lg border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-3 px-3 py-2.5 text-sm">
              <span className="text-muted-foreground mt-0.5 [&_svg]:size-4">{row.icon}</span>
              <dt className="text-muted-foreground w-24 shrink-0">{row.label}</dt>
              <dd className="min-w-0 flex-1 break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </FormSection>
  );
}
