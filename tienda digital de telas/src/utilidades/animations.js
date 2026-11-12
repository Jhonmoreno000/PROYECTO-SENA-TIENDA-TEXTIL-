import gsap from 'gsap';

export const EASES = {
  spring: 'back.out(1.25)',
  springGentle: 'back.out(1.15)',
  springSoft: 'back.out(1.08)',
  smooth: 'power3.out',
  smoother: 'power4.out',
  smoothIn: 'power3.in',
  snappy: 'power2.out',
  snappyIn: 'power2.in',
  bounce: 'elastic.out(1, 0.4)',
  bounceSoft: 'elastic.out(1, 0.2)',
  inertia: 'power2.out',
  linear: 'none',
};

export const DURATIONS = {
  fast: 0.15,
  normal: 0.26,
  slow: 0.35,
  slower: 0.45,
  slowest: 0.55,
};

export function springTo(el, vars) {
  return gsap.to(el, { ...vars, ease: EASES.spring, force3D: true, overwrite: 'auto' });
}

export function springFrom(el, vars) {
  return gsap.from(el, { ...vars, ease: EASES.spring, force3D: true, overwrite: 'auto' });
}

export function springFromTo(el, fromVars, toVars) {
  return gsap.fromTo(el, fromVars, { ...toVars, ease: EASES.spring, force3D: true, overwrite: 'auto' });
}

export function animatePresence(el, onEnter = true) {
  if (onEnter) {
    return gsap.fromTo(el,
      { opacity: 0, scale: 0.98, y: 8 },
      { opacity: 1, scale: 1, y: 0, duration: DURATIONS.normal, ease: EASES.springGentle, force3D: true, clearProps: 'transform' }
    );
  }
  return gsap.to(el, {
    opacity: 0, scale: 0.98, y: 6, duration: DURATIONS.fast, ease: EASES.smoothIn, force3D: true
  });
}

export function microPress(el) {
  return gsap.to(el, { scale: 0.97, duration: 0.08, ease: EASES.snappyIn, force3D: true });
}

export function microRelease(el) {
  return gsap.to(el, { scale: 1, duration: 0.18, ease: EASES.spring, force3D: true, overwrite: 'auto' });
}

export function microHoverEnter(el) {
  return gsap.to(el, { scale: 1.03, duration: 0.18, ease: EASES.smooth, force3D: true, overwrite: 'auto' });
}

export function microHoverLeave(el) {
  return gsap.to(el, { scale: 1, duration: 0.18, ease: EASES.snappy, force3D: true, overwrite: 'auto' });
}

export function createRipple(e, container) {
  const rect = container.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.5;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement('span');
  ripple.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,0.3);pointer-events:none;z-index:0;`;
  container.appendChild(ripple);
  gsap.to(ripple, { scale: 2, opacity: 0, duration: 0.35, ease: EASES.smooth, onComplete: () => ripple.remove() });
}

export function staggerItems(items, options = {}) {
  const { from = {}, to = {}, stagger = 0.025, delay = 0 } = options;
  return gsap.fromTo(items,
    { opacity: 0, y: 12, ...from },
    { opacity: 1, y: 0, duration: DURATIONS.normal, stagger, ease: EASES.smooth, force3D: true, clearProps: 'transform', delay, ...to }
  );
}

export function nativeSlide(dir = 1) {
  return {
    x: dir * 30,
    opacity: 0,
    scale: 0.99,
  };
}
