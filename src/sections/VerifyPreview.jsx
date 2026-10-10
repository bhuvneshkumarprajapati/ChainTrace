import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

function VerifyPreview() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#05090b] px-6 py-28">
      
      {/* Background glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:items-center">

        {/* LEFT */}
        <div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#36e6ad]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />

            Product verification
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl"
          >
            Know what
            <br />
            <span className="text-[#36e6ad]">you are buying.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 max-w-lg text-sm leading-6 text-white/40"
          >
            Enter a product ID or scan its QR code to check its
            verification record, blockchain proof, and supply-chain history.
          </motion.p>

          {/* FEATURES */}
          <div className="mt-8 space-y-4">

            <Feature
              icon={ShieldCheck}
              title="Blockchain proof"
              text="Verify the product record against its registered proof."
            />

            <Feature
              icon={CheckCircle2}
              title="Authenticity status"
              text="See whether the product has a valid verification record."
            />

            <Feature
              icon={ScanLine}
              title="Supply-chain history"
              text="Trace the recorded journey through authorized handoffs."
            />

          </div>

        </div>

        {/* RIGHT - VERIFY CARD */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >

          <div className="relative border border-white/10 bg-[#081014] p-6 md:p-8">

            {/* Card header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">

              <div>
                <div className="text-xs font-semibold">
                  Verify product
                </div>

                <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/30">
                  ChainTrace verification
                </div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                <ShieldCheck size={18} />
              </div>

            </div>

            {/* Input */}
            <div className="mt-8">

              <label className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                Product ID
              </label>

              <div className="mt-3 flex border border-white/10 bg-black/20">

                <input
                  type="text"
                  placeholder="CT-2026-XXXX"
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-white/20"
                />

                <button
                  type="button"
                  className="m-1 flex items-center gap-2 bg-[#36e6ad] px-4 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
                >
                  Verify
                  <ArrowUpRight size={14} />
                </button>

              </div>

            </div>

            {/* QR */}
            <div className="mt-8 flex items-center gap-5 border border-dashed border-white/10 p-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                <ScanLine size={28} strokeWidth={1.5} />
              </div>

              <div>
                <div className="text-sm">
                  Scan QR code
                </div>

                <p className="mt-1 text-xs leading-5 text-white/30">
                  Use your phone camera to verify a registered product.
                </p>
              </div>

            </div>

            {/* Demo result */}
            <div className="mt-8 border border-[#36e6ad]/20 bg-[#36e6ad]/5 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#36e6ad]/10 text-[#36e6ad]">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <div className="text-sm font-medium">
                    Verification ready
                  </div>

                  <div className="mt-1 text-[10px] text-white/30">
                    Enter a product ID to begin verification.
                  </div>
                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.02] text-[#36e6ad]">
        <Icon size={16} strokeWidth={1.5} />
      </div>

      <div>
        <div className="text-sm font-medium">
          {title}
        </div>

        <p className="mt-1 text-xs leading-5 text-white/30">
          {text}
        </p>
      </div>

    </div>
  );
}

export default VerifyPreview;