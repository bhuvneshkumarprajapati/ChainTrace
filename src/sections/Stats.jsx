import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

const stats = [
  {
    value: 1284,
    suffix: "+",
    label: "Products tracked",
  },
  {
    value: 99.8,
    suffix: "%",
    label: "Proof integrity",
    decimals: 1,
  },
  {
    value: 38,
    suffix: "+",
    label: "Active partners",
  },
];

function Stats() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#05090b] px-6 py-24">

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#36e6ad]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />
          Trust at scale
        </motion.div>

        <div className="grid border-y border-white/10 md:grid-cols-3">

          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
              }}
              className={`group relative px-6 py-12 md:px-10 ${
                index !== 0 ? "border-t md:border-l md:border-t-0" : ""
              } border-white/10`}
            >

              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals || 0}
              />

              <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/30">
                {stat.label}
              </div>

              <div className="absolute bottom-0 left-0 h-px w-0 bg-[#36e6ad] transition-all duration-500 group-hover:w-full" />

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}

function AnimatedNumber({ value, suffix, decimals }) {
  const motionValue = useMotionValue(0);

  const springValue = useSpring(motionValue, {
    stiffness: 70,
    damping: 25,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.div
      className="text-5xl font-medium tracking-[-0.04em] md:text-7xl"
    >
      <motion.span>
        {springValue.get().toFixed(decimals)}
      </motion.span>

      <span className="text-[#36e6ad]">
        {suffix}
      </span>
    </motion.div>
  );
}

export default Stats;