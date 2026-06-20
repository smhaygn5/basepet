"use client";

import { motion, type Variants } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PetSprite } from "@/components/pet/PetSprite";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-12 px-6 py-16 lg:flex-row lg:gap-8 lg:py-24">
      {/* Sol: Hero metni */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-1 flex-col gap-6"
      >
        <motion.div
          variants={item}
          className="flex w-fit cursor-default select-none items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[rgba(16,185,129,0.1)] px-3 py-1 text-xs font-medium text-[var(--accent-green)]"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-green)]" />
          LIVE ON BASE NETWORK
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-xl cursor-default select-none text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Take care of your{" "}
          <span className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            on-chain pet
          </span>{" "}
          on Base
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-md cursor-default select-none text-lg text-[var(--text-secondary)]"
        >
          Feed, play, clean, and grow your 3D pet. Every care action becomes an
          on-chain memory on Base.
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap items-center gap-4">
          <ConnectButton label="Connect Wallet" />
        </motion.div>

        <motion.div
          variants={item}
          className="flex cursor-default select-none items-center gap-3 text-sm text-[var(--text-secondary)]"
        >
          <div className="flex -space-x-2">
            {["🐱", "🐶", "🐰"].map((e) => (
              <span
                key={e}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--bg-tertiary)] text-xs"
              >
                {e}
              </span>
            ))}
          </div>
          Join 10k+ pet owners
        </motion.div>
      </motion.div>

      {/* Sağ: 3D sahne + floating kartlar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative h-[420px] w-full max-w-md flex-1"
      >
        <div className="glass-card h-full w-full overflow-hidden">
          <PetSprite />
        </div>

        {/* Floating kart: Action Fed */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card absolute -left-4 top-8 cursor-default select-none px-4 py-2 text-sm"
        >
          <p className="font-semibold">ACTION: FED</p>
          <p className="text-[var(--accent-amber)]">+50 XP ⭐</p>
        </motion.div>

        {/* Floating kart: Care Streak */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass-card absolute -right-4 bottom-8 cursor-default select-none px-4 py-2 text-sm"
        >
          <p className="font-semibold">CARE STREAK</p>
          <p className="text-[var(--accent-amber)]">🔥 5 Days</p>
        </motion.div>
      </motion.div>
    </main>
  );
}
