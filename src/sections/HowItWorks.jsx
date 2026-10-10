import { motion } from "framer-motion";
import {
  Factory,
  Database,
  ShieldCheck,
  Truck,
  ScanLine,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Manufacture",
    description:
      "The manufacturer creates a product and registers its unique identity in ChainTrace.",
    icon: Factory,
  },
  {
    number: "02",
    title: "Register Product",
    description:
      "Product details are stored securely and linked with a unique verification record.",
    icon: Database,
  },
  {
    number: "03",
    title: "Blockchain Proof",
    description:
      "A cryptographic proof is recorded on the blockchain to make the product history tamper-resistant.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Supply Chain",
    description:
      "Every authorized handoff creates a transparent event in the product journey.",
    icon: Truck,
  },
  {
    number: "05",
    title: "Verify Product",
    description:
      "Customers can scan or enter the product ID to verify authenticity and view its history.",
    icon: ScanLine,
  },
];

function HowItWorks() {
  return (
    <section
      id="journey"
      className="relative overflow-hidden border-t border-white/10 bg-[#05090b] px-6 py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="max-w-2xl">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#36e6ad]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />

            Product journey
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl"
          >
            From factory
            <br />
            <span className="text-[#36e6ad]">to verification.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 max-w-xl text-sm leading-6 text-white/40"
          >
            ChainTrace connects every stage of the product journey into one
            transparent and verifiable record.
          </motion.p>

        </div>

        {/* TIMELINE */}
        <div className="relative mt-20">

          {/* Main line */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-white/10 md:left-1/2 md:block md:-translate-x-1/2" />

          <div className="space-y-10 md:space-y-16">

            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                  }}
                  className={`relative flex md:items-center ${
                    isLeft
                      ? "md:justify-start"
                      : "md:justify-end"
                  }`}
                >

                  {/* Center node */}
                  <div className="absolute left-6 top-6 z-10 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-[#36e6ad] shadow-[0_0_18px_#36e6ad] md:block" />

                  {/* CARD */}
                  <div
                    className={`w-full md:w-[43%] ${
                      isLeft ? "md:text-right" : "md:text-left"
                    }`}
                  >

                    <div className="group relative border border-white/10 bg-[#081014]/80 p-7 backdrop-blur-xl transition-all duration-500 hover:border-[#36e6ad]/30">

                      {/* Number */}
                      <div
                        className={`mb-6 flex items-center gap-3 ${
                          isLeft
                            ? "md:justify-end"
                            : "md:justify-start"
                        }`}
                      >
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-[#36e6ad]">
                          {step.number}
                        </span>

                        <span className="h-px w-8 bg-[#36e6ad]/30" />
                      </div>

                      {/* Icon */}
                      <div
                        className={`mb-5 flex ${
                          isLeft
                            ? "md:justify-end"
                            : "md:justify-start"
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad] transition-all duration-500 group-hover:border-[#36e6ad]/50 group-hover:bg-[#36e6ad]/10">
                          <Icon size={21} strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-medium tracking-tight">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-4 text-sm leading-6 text-white/40">
                        {step.description}
                      </p>

                      {/* Hover line */}
                      <div
                        className={`absolute bottom-0 h-px w-0 bg-[#36e6ad] transition-all duration-500 group-hover:w-full ${
                          isLeft ? "right-0" : "left-0"
                        }`}
                      />

                    </div>

                  </div>

                </motion.div>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;