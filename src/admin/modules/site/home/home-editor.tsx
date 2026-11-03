"use client";

import { GalleryHorizontal, Handshake, LayoutGrid, Newspaper, Sparkles, Type } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import type { HomePage } from "@/admin/lib/cms/types/pages";

import { EditorTabs } from "../editor-tabs";
import { homeSchema } from "../site-schemas";
import { BlogTab } from "./blog-tab";
import { HeroTab } from "./hero-tab";
import { HighlightsTab } from "./highlights-tab";
import { IntroTab } from "./intro-tab";
import { PartnersTab } from "./partners-tab";
import { ServicesTab } from "./services-tab";

/** `/admin/pages/home` — every block of the Home page, one tab per section, each with a live preview. */
export function HomePageEditor() {
  const editor = useSingletonEditor("home", homeSchema);
  return (
    <SingletonEditor
      editor={editor}
      title="Trang chủ"
      description="Mỗi tab là một khối của trang chủ, theo thứ tự từ trên xuống."
    >
      <HomeTabs />
    </SingletonEditor>
  );
}

function HomeTabs() {
  const { control } = useFormContext<HomePage>();
  const [slides, services, blogItems] = useWatch({ control, name: ["hero.slides", "services", "blogCarousel.items"] });
  return (
    <EditorTabs
      tabs={[
        {
          value: "hero",
          label: "Hero",
          icon: GalleryHorizontal,
          fields: ["hero"],
          count: slides?.length,
          content: <HeroTab />,
        },
        { value: "intro", label: "Giới thiệu", icon: Type, fields: ["intro"], content: <IntroTab /> },
        { value: "highlights", label: "Highlight", icon: Sparkles, fields: ["highlights"], content: <HighlightsTab /> },
        {
          value: "services",
          label: "Dịch vụ",
          icon: LayoutGrid,
          fields: ["services"],
          count: services?.length,
          content: <ServicesTab />,
        },
        {
          value: "blog",
          label: "Blog carousel",
          icon: Newspaper,
          fields: ["blogCarousel"],
          count: blogItems?.length,
          content: <BlogTab />,
        },
        { value: "partners", label: "Đối tác", icon: Handshake, fields: ["partners"], content: <PartnersTab /> },
      ]}
    />
  );
}
