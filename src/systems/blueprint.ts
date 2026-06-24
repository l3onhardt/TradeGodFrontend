import './blueprint.css';

/**
 * Blueprint decoration system. Pure DOM scaffolding — no animation here.
 * reveals.ts drives the draw-in (edges scaleX/Y, corners/ghost fade). Under
 * reduced-motion the CSS shows everything statically, so these are safe no-ops.
 */

export interface FrameOpts {
  /** big ghost numeral painted behind the section (e.g. "01"); omit for none */
  numeral?: string;
  /** add the tick ruler in the top-left of the frame */
  ticks?: boolean;
}

/** Inject a drawn-in blueprint frame (4 edges + 4 corner brackets) into a section. */
export function frameSection(sec: HTMLElement, opts: FrameOpts = {}): void {
  sec.classList.add('bp-host');
  if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';

  const frame = document.createElement('div');
  frame.className = 'bp-frame';
  frame.setAttribute('aria-hidden', 'true');
  (['top', 'right', 'bottom', 'left'] as const).forEach((side) => {
    const e = document.createElement('span');
    e.className = `bp-edge ${side}`;
    frame.appendChild(e);
  });
  (['tl', 'tr', 'bl', 'br'] as const).forEach((c) => {
    const corner = document.createElement('span');
    corner.className = `bp-corner ${c}`;
    frame.appendChild(corner);
  });
  if (opts.ticks) {
    const ticks = document.createElement('div');
    ticks.className = 'bp-ticks';
    ticks.innerHTML = '<i></i>'.repeat(11);
    frame.appendChild(ticks);
  }
  // frame goes first so it paints behind the content
  sec.insertBefore(frame, sec.firstChild);

  if (opts.numeral) {
    const ghost = document.createElement('span');
    ghost.className = 'bp-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = opts.numeral;
    sec.insertBefore(ghost, sec.firstChild);
  }
}

/** Mount the global scroll spine (fixed vertical line + scroll-fill + diamond knob). */
export function mountSpine(app: HTMLElement): HTMLElement {
  const spine = document.createElement('div');
  spine.className = 'bp-spine';
  spine.setAttribute('aria-hidden', 'true');
  spine.innerHTML = '<i></i><span class="knob"></span>';
  app.appendChild(spine);
  return spine;
}
