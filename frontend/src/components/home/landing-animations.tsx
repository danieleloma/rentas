'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Helper: scroll-reveal that won't hide elements until the trigger fires
function reveal(
  targets: string,
  trigger: string,
  vars: gsap.TweenVars = {},
) {
  gsap.from(targets, {
    opacity: 0,
    y: 36,
    duration: 0.65,
    ease: 'power3.out',
    immediateRender: false,   // ← key: don't set opacity:0 until trigger fires
    ...vars,
    scrollTrigger: {
      trigger,
      start: 'top 95%',       // fires as section enters from bottom
      once: true,
      ...(vars.scrollTrigger as object | undefined),
    },
  });
}

export function LandingAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero entrance (no ScrollTrigger — plays on load) ─────────────
      gsap.from('[data-hero-badge]', { opacity: 0, y: -14, duration: 0.7, delay: 0.15, ease: 'power2.out' });
      gsap.from('[data-hero-title]', { opacity: 0, y: 36,  duration: 0.9, delay: 0.25, ease: 'power3.out' });
      gsap.from('[data-hero-sub]',   { opacity: 0, y: 20,  duration: 0.75, delay: 0.45, ease: 'power2.out' });
      gsap.from('[data-hero-cta] > *', { opacity: 0, y: 16, duration: 0.6, delay: 0.6, stagger: 0.1, ease: 'power2.out' });

      // ── Hero image parallax ──────────────────────────────────────────
      gsap.to('[data-hero-image]', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-hero-section]',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // ── Stats ────────────────────────────────────────────────────────
      reveal('[data-stat]', '[data-stats-section]', { y: 28, duration: 0.55, stagger: 0.09 });

      // ── Problem statement ────────────────────────────────────────────
      reveal(
        '[data-problem-section] h2, [data-problem-section] p, [data-problem-section] [data-tag]',
        '[data-problem-section]',
        { y: 22, stagger: 0.1 },
      );

      // ── Steps heading + cards ────────────────────────────────────────
      reveal('[data-steps-heading]', '[data-steps-section]', { y: 20, duration: 0.6 });
      reveal('[data-step]',          '[data-steps-section]', { y: 48, duration: 0.7, stagger: 0.15 });

      // ── Feature grid ─────────────────────────────────────────────────
      reveal('[data-features-heading]', '[data-features-section]', { y: 20, duration: 0.6 });
      reveal('[data-feature]',          '[data-features-section]', { y: 44, duration: 0.65, stagger: 0.08 });

      // ── CTA ──────────────────────────────────────────────────────────
      reveal(
        '[data-cta-section] h2, [data-cta-section] p, [data-cta-section] [data-cta-btn]',
        '[data-cta-section]',
        { y: 24, stagger: 0.12 },
      );

      // Recalculate positions after hydration
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
