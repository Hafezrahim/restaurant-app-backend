/**
 * Auto-focus the first meaningful interactive element inside a portaled
 * Radix content (Dialog, Sheet, Popover). Skips the floating "Close" button
 * so RTL users land on the actual content (input / primary action) instead
 * of the dismiss control.
 *
 * Pass to Radix `onOpenAutoFocus`.
 */
export function focusFirstInteractive(event: Event) {
  const content = event.currentTarget as HTMLElement | null;
  if (!content) return;

  const selector = [
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    'button:not([disabled]):not([data-radix-collection-item])',
    "[href]",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  const candidates = Array.from(
    content.querySelectorAll<HTMLElement>(selector),
  ).filter((el) => {
    // Skip the absolutely-positioned close button rendered by Dialog/Sheet
    if (el.querySelector('span.sr-only')?.textContent?.trim() === "Close") {
      return false;
    }
    if (el.getAttribute("aria-label") === "Close") return false;
    return true;
  });

  const target = candidates[0];
  if (target) {
    event.preventDefault();
    target.focus({ preventScroll: true });
  }
}
