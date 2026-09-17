"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // mode="wait" leaves a brief gap between the old page exiting and the
    // new one entering (needed so two full pages never stack on top of
    // each other). That gap used to show raw white — the layout's cream
    // background lives on an ancestor of this component, and during the
    // gap nothing here was painting over the page's white default — which
    // read as a flashbang. Giving this wrapper its own bg-wheat means the
    // gap is invisible instead of a flash.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="bg-wheat"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
