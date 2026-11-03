import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * Tags the CMS rich-text editor can produce (Tiptap: paragraphs, bold, italic, underline, links, lists, quotes).
 * Everything else is dropped; external links open in a new tab.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs): sanitizeHtml.Tag => {
      const href = attribs.href ?? "";
      return {
        tagName,
        attribs: /^https?:/i.test(href) ? { href, target: "_blank", rel: "noopener noreferrer" } : { href },
      };
    },
  },
  // Blank lines typed in the editor come through as empty paragraphs.
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim(),
};

export const sanitizeRichText = (html: string | null | undefined) => sanitizeHtml(html ?? "", OPTIONS).trim();
