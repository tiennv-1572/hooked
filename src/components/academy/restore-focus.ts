import type { RefObject } from "react";

/**
 * The Academy overlays are opened programmatically (no Radix `Dialog.Trigger`), so Radix would drop focus
 * on <body> when they close. Use as `onCloseAutoFocus`: returns focus to the element that opened the
 * overlay — unless another overlay is already open (program → registration swap).
 */
export function restoreFocus(event: Event, target: RefObject<HTMLElement | null> | undefined) {
  event.preventDefault();
  if (document.querySelector('[role="dialog"][data-state="open"]')) return;
  const element = target?.current;
  if (element?.isConnected) element.focus({ preventScroll: true });
}
