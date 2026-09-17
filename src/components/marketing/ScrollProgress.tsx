"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A slim accent-colored bar pinned under the nav that fills as the visitor
 * scrolls the page. Purely decorative, but it's the one piece of motion
 * that's visible immediately and continuously, so it reads as "this page
 * moves" even before the first scroll-reveal has a chance to fire. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 right-0 left-0 z-50 h-[2.5px] origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
