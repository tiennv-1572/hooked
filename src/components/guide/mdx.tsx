import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { AdminPath } from "@/components/guide/admin-path";
import { Draft } from "@/components/guide/draft";
import { FieldTable } from "@/components/guide/field-table";
import { OnWebsite } from "@/components/guide/on-website";
import { Screenshot } from "@/components/guide/screenshot";

/**
 * Components every guide page may use in MDX without importing them: Fumadocs' defaults (Callout, Cards…),
 * Steps, Tabs, Accordions, and the project's own — see docs/huong-dan/WRITING.md.
 */
export function getGuideMdxComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    AdminPath,
    Draft,
    FieldTable,
    OnWebsite,
    Screenshot,
    Step,
    Steps,
    Tab,
    Tabs,
    ...components,
  } satisfies MDXComponents;
}
