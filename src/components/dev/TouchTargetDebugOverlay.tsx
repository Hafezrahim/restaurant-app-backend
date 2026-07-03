import React, { useEffect, useState, useCallback } from 'react';

/**
 * Temporary debug overlay that highlights interactive touch targets and
 * flags any that fall below the WCAG 2.5.5 minimum of 44×44 CSS pixels.
 *
 * Toggle with Alt+T, or append ?debugTouch=1 to the URL.
 * Green outline = passes 44×44. Red outline + red fill = below minimum.
 * Works in both LTR and RTL — measurements are pixel-based.
 */

const MIN = 44;

const SELECTOR = [
  'button',
  '[role="button"]',
  'a[href]',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="switch"]',
  '[role="slider"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="tab"]',
  '[role="menuitem"]',
].join(',');

type Box = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
  effectiveW: number;
  effectiveH: number;
  ok: boolean;
  label: string;
};

function getEffectiveHit(el: Element): { w: number; h: number } {
  const rect = el.getBoundingClientRect();
  let w = rect.width;
  let h = rect.height;
  // Include pseudo-element hit expansions (e.g. slider thumb ::before -inset-3)
  for (const pseudo of ['::before', '::after'] as const) {
    const cs = getComputedStyle(el, pseudo);
    if (cs.content && cs.content !== 'none' && cs.position === 'absolute') {
      const parse = (v: string) => (v.endsWith('px') ? parseFloat(v) : 0);
      const insetX = -(parse(cs.left) + parse(cs.right));
      const insetY = -(parse(cs.top) + parse(cs.bottom));
      if (insetX > 0) w = Math.max(w, rect.width + insetX);
      if (insetY > 0) h = Math.max(h, rect.height + insetY);
    }
  }
  return { w, h };
}

export const TouchTargetDebugOverlay: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debugTouch') === '1';
  });
  const [boxes, setBoxes] = useState<Box[]>([]);

  // Alt+T toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setEnabled((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const measure = useCallback(() => {
    const nodes = Array.from(document.querySelectorAll(SELECTOR));
    const next: Box[] = [];
    nodes.forEach((el, i) => {
      if (el.closest('[data-touch-debug-root]')) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const { w, h } = getEffectiveHit(el);
      const ok = w >= MIN && h >= MIN;
      const label =
        (el.getAttribute('aria-label') ||
          (el as HTMLElement).innerText ||
          el.tagName).toString().trim().slice(0, 18) || el.tagName.toLowerCase();
      next.push({
        key: `${i}-${Math.round(rect.left)}-${Math.round(rect.top)}`,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        effectiveW: w,
        effectiveH: h,
        ok,
        label,
      });
    });
    setBoxes(next);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setBoxes([]);
      return;
    }
    measure();
    const onResize = () => measure();
    const onScroll = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    const mo = new MutationObserver(() => measure());
    mo.observe(document.body, { subtree: true, childList: true, attributes: true });
    const interval = window.setInterval(measure, 500);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      mo.disconnect();
      window.clearInterval(interval);
    };
  }, [enabled, measure]);

  if (!enabled) return null;

  const fails = boxes.filter((b) => !b.ok).length;
  const dir = typeof document !== 'undefined' ? document.documentElement.dir || 'ltr' : 'ltr';

  return (
    <div
      data-touch-debug-root
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden
    >
      {boxes.map((b) => {
        const color = b.ok ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.95)';
        const bg = b.ok ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.22)';
        return (
          <div
            key={b.key}
            style={{
              position: 'fixed',
              left: b.left,
              top: b.top,
              width: b.width,
              height: b.height,
              outline: `2px solid ${color}`,
              outlineOffset: 0,
              background: bg,
              borderRadius: 2,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -14,
                insetInlineStart: 0,
                fontSize: 10,
                lineHeight: '12px',
                padding: '1px 4px',
                background: color,
                color: '#fff',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}
            >
              {Math.round(b.effectiveW)}×{Math.round(b.effectiveH)}
            </span>
          </div>
        );
      })}
      <div
        className="pointer-events-auto"
        style={{
          position: 'fixed',
          bottom: 12,
          insetInlineEnd: 12,
          background: 'rgba(15,23,42,0.92)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 8,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12,
          lineHeight: 1.5,
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          direction: 'ltr',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Touch-target debug</div>
        <div>dir: <b>{dir}</b> · min: {MIN}×{MIN}</div>
        <div>total: {boxes.length} · <span style={{ color: '#4ade80' }}>pass {boxes.length - fails}</span> · <span style={{ color: '#f87171' }}>fail {fails}</span></div>
        <div style={{ marginTop: 6, opacity: 0.7 }}>Alt+T to toggle</div>
      </div>
    </div>
  );
};

export default TouchTargetDebugOverlay;
