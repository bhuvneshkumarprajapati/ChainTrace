import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import BlockchainScene from "../components/three/BlockchainScene";

function Hero() {
  return (
    <section className="relative overflow-hidden pt-20">

      {/* subtle background glow */}
      <div className="pointer-events-none absolute left-1/2 top-40 h-96 w-96 -translate-x-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">

        {/* LEFT */}
        <div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#36e6ad]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />

            Trust layer for the physical world
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-2xl text-6xl font-medium leading-[0.94] tracking-[-0.055em] md:text-8xl"
          >
            Verify every
            <br />

            product.

            <br />

            <span className="text-[#36e6ad]">
              Trust every
              <br />
              journey.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 max-w-lg text-sm leading-6 text-white/40"
          >
            ChainTrace creates a transparent, tamper-resistant
            record for every handoff — from the moment a product
            leaves the manufacturer to the moment it reaches you.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >

            <a
              href="/verify"
              className="group flex items-center gap-2 bg-[#36e6ad] px-5 py-3 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
            >
              Verify a product

              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>

            <a
              href="#journey"
              className="border border-white/15 px-5 py-3 text-xs text-white/60 transition hover:border-white/40 hover:text-white"
            >
              Explore platform
            </a>

          </motion.div>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex gap-10"
          >

            <Stat value="1,284" label="products tracked" />

            <Stat value="99.8%" label="proof integrity" />

            <Stat value="38" label="active partners" />

          </motion.div>

        </div>

        {/* RIGHT */}
        <BlockchainVisual />

      </div>

    </section>
  );
}


/* STAT */

function Stat({ value, label }) {
  return (
    <div>

      <div className="text-sm font-semibold">
        {value}
      </div>

      <div className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/30">
        {label}
      </div>

    </div>
  );
}


/* BLOCKCHAIN VISUAL */

function BlockchainVisual() {

  const nodes = [
    {
      className: "left-1/2 top-10 -translate-x-1/2",
      label: "Manufacturer",
    },
    {
      className: "right-10 top-1/2 -translate-y-1/2",
      label: "Distributor",
    },
    {
      className: "bottom-10 left-1/2 -translate-x-1/2",
      label: "Retailer",
    },
    {
      className: "left-10 top-1/2 -translate-y-1/2",
      label: "Supplier",
    },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px]">

      {/* OUTER FRAME */}
      <div className="absolute inset-0 border border-white/10 bg-[#081014]" />

      {/* 3D BLOCKCHAIN */}
      <div className="absolute inset-0">
        <BlockchainScene />
      </div>

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(#36e6ad 1px, transparent 1px), linear-gradient(90deg, #36e6ad 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      {/* CONNECTING LINES */}
      <div className="absolute left-1/2 top-1/2 h-[70%] w-px -translate-x-1/2 -translate-y-1/2 bg-[#36e6ad]/20" />

      <div className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 -translate-y-1/2 bg-[#36e6ad]/20" />

      {/* CENTER BLOCKCHAIN */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 20px rgba(54,230,173,0.05)",
            "0 0 60px rgba(54,230,173,0.2)",
            "0 0 20px rgba(54,230,173,0.05)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#36e6ad]/50 bg-[#081014]"
      >

        <div className="text-center">

          <ShieldCheck
            size={28}
            className="mx-auto text-[#36e6ad]"
            strokeWidth={1.5}
          />

          <div className="mt-2 text-[7px] uppercase tracking-[0.2em] text-[#36e6ad]">
            blockchain
          </div>

        </div>

      </motion.div>

      {/* SUPPLY CHAIN NODES */}
      {nodes.map((node, index) => (
        <motion.div
          key={node.label}
          className={`absolute ${node.className}`}
          animate={{
            y: [0, -7, 0],
          }}
          transition={{
            duration: 2.4 + index * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >

          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#36e6ad]/40 bg-[#081014]">

            <span className="h-2 w-2 rounded-full bg-[#36e6ad] shadow-[0_0_12px_#36e6ad]" />

          </div>

          <div className="mt-2 text-center text-[8px] uppercase tracking-wider text-white/30">
            {node.label}
          </div>

        </motion.div>
      ))}

    </div>
  );
}

export default Hero;