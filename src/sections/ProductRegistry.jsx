import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Package,
  ShieldAlert,
} from "lucide-react";

const products = [
  {
    id: "CT-2026-001",
    name: "Organic Coffee Beans",
    manufacturer: "Green Valley Foods",
    status: "Verified",
    location: "Bangalore, India",
    type: "Food",
  },
  {
    id: "CT-2026-002",
    name: "Smart Sensor X1",
    manufacturer: "NovaTech Industries",
    status: "Verified",
    location: "Pune, India",
    type: "Electronics",
  },
  {
    id: "CT-2026-003",
    name: "Premium Cotton",
    manufacturer: "EarthWeave Textiles",
    status: "In Transit",
    location: "Delhi, India",
    type: "Textile",
  },
];

function ProductRegistry() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#05090b] px-6 py-28">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

          <div className="max-w-2xl">

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#36e6ad]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />

              Product registry
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl"
            >
              Every product.
              <br />
              <span className="text-[#36e6ad]">
                One record.
              </span>
            </motion.h2>

          </div>

          <motion.a
            href="/products"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="group flex w-fit items-center gap-2 border border-white/15 px-5 py-3 text-xs text-white/60 transition hover:border-[#36e6ad]/50 hover:text-[#36e6ad]"
          >
            View registry

            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </motion.a>

        </div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-wrap gap-2"
        >

          <Filter active>All products</Filter>
          <Filter>Verified</Filter>
          <Filter>In transit</Filter>
          <Filter>Under review</Filter>

        </motion.div>

        {/* PRODUCTS */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}

        </div>

      </div>
    </section>
  );
}


/* FILTER */

function Filter({ children, active = false }) {
  return (
    <button
      type="button"
      className={`border px-4 py-2 text-[10px] transition ${
        active
          ? "border-[#36e6ad]/40 bg-[#36e6ad]/10 text-[#36e6ad]"
          : "border-white/10 text-white/35 hover:border-white/25 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}


/* PRODUCT CARD */

function ProductCard({ product, index }) {

  const isVerified = product.status === "Verified";
  const isTransit = product.status === "In Transit";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
      }}
      whileHover={{ y: -5 }}
      className="group relative border border-white/10 bg-[#081014] p-6 transition-all duration-500 hover:border-[#36e6ad]/30"
    >

      {/* Top */}
      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.02] text-[#36e6ad]">
          <Package size={19} strokeWidth={1.5} />
        </div>

        <Status status={product.status} />

      </div>

      {/* Product */}
      <div className="mt-7">

        <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
          {product.id}
        </div>

        <h3 className="mt-2 text-xl font-medium tracking-tight">
          {product.name}
        </h3>

        <p className="mt-2 text-xs text-white/35">
          {product.type}
        </p>

      </div>

      {/* Details */}
      <div className="mt-8 border-t border-white/10 pt-5">

        <div className="flex justify-between gap-4">

          <div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
              Manufacturer
            </div>

            <div className="mt-1 text-xs text-white/60">
              {product.manufacturer}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
              Location
            </div>

            <div className="mt-1 text-xs text-white/60">
              {product.location}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom action */}
      <div className="mt-6 flex items-center justify-between">

        <span className="text-[9px] uppercase tracking-[0.16em] text-white/20">
          Blockchain record
        </span>

        <a
          href={`/product/${product.id}`}
          className="flex items-center gap-1 text-[10px] text-[#36e6ad] opacity-70 transition group-hover:opacity-100"
        >
          View
          <ArrowUpRight size={12} />
        </a>

      </div>

      {/* Hover line */}
      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#36e6ad] transition-all duration-500 group-hover:w-full" />

    </motion.div>
  );
}


/* STATUS */

function Status({ status }) {

  const isVerified = status === "Verified";
  const isTransit = status === "In Transit";

  const Icon = isVerified
    ? CheckCircle2
    : isTransit
      ? Clock3
      : ShieldAlert;

  return (
    <div
      className={`flex items-center gap-1.5 text-[9px] uppercase tracking-wider ${
        isVerified
          ? "text-[#36e6ad]"
          : isTransit
            ? "text-yellow-400"
            : "text-red-400"
      }`}
    >
      <Icon size={12} />
      {status}
    </div>
  );
}

export default ProductRegistry;