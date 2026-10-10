import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statusConfig = {
  REGISTERED: {
    label: "Registered",
    icon: CheckCircle2,
    className:
      "text-[#36e6ad] border-[#36e6ad]/20 bg-[#36e6ad]/5",
  },

  IN_TRANSIT: {
    label: "In Transit",
    icon: Clock3,
    className:
      "text-amber-300 border-amber-300/20 bg-amber-300/5",
  },

  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className:
      "text-[#36e6ad] border-[#36e6ad]/20 bg-[#36e6ad]/5",
  },

  UNDER_REVIEW: {
    label: "Under Review",
    icon: ShieldAlert,
    className:
      "text-orange-300 border-orange-300/20 bg-orange-300/5",
  },

  FLAGGED: {
    label: "Flagged",
    icon: ShieldAlert,
    className:
      "text-red-300 border-red-300/20 bg-red-300/5",
  },
};

const filters = [
  { value: "ALL", label: "All" },
  { value: "REGISTERED", label: "Registered" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "FLAGGED", label: "Flagged" },
];

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");

        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Products fetch error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const manufacturerName =
        product.manufacturer?.name ||
        product.manufacturer?.organization ||
        "";

      const organization =
        product.manufacturer?.organization || "";

      const ownerName =
        product.currentOwner?.name ||
        product.currentOwner?.organization ||
        "";

      const matchesSearch =
        !query ||
        product.name
          ?.toLowerCase()
          .includes(query) ||
        product.productId
          ?.toLowerCase()
          .includes(query) ||
        product.category
          ?.toLowerCase()
          .includes(query) ||
        product.location
          ?.toLowerCase()
          .includes(query) ||
        manufacturerName
          .toLowerCase()
          .includes(query) ||
        organization
          .toLowerCase()
          .includes(query) ||
        ownerName
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "ALL" ||
        product.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  // ==========================================
  // COUNTS
  // ==========================================
  const blockchainProducts = products.filter(
    (product) => Boolean(product.blockchainTxHash)
  ).length;

  const deliveredProducts = products.filter(
    (product) => product.status === "DELIVERED"
  ).length;

  // ==========================================
  // CLEAR SEARCH
  // ==========================================
  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#05090b] text-white">

      {/* ==========================================
          NAVBAR
      ========================================== */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#36e6ad] text-black">
              <Package size={17} />
            </div>

            <span className="text-sm font-semibold tracking-wide">
              chaintrace
            </span>
          </Link>

          <nav className="flex items-center gap-5">

            <Link
              to="/"
              className="hidden text-xs text-white/40 transition hover:text-white sm:block"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="hidden text-xs text-[#36e6ad] sm:block"
            >
              Products
            </Link>

            <Link
              to="/verify"
              className="text-xs text-white/40 transition hover:text-[#36e6ad]"
            >
              Verify
            </Link>

            <Link
              to="/login"
              className="bg-[#36e6ad] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
            >
              Login
            </Link>

          </nav>

        </div>
      </header>

      {/* ==========================================
          PAGE
      ========================================== */}
      <main className="relative overflow-hidden">

        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#36e6ad]/5 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16">

          {/* ==========================================
              HERO
          ========================================== */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
          >

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#36e6ad]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad] shadow-[0_0_10px_#36e6ad]" />
              Supply Chain Registry
            </div>

            <div className="mt-5 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">

              <div>

                <h1 className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl">
                  Products tracked
                  <br />
                  <span className="text-white/25">
                    on ChainTrace.
                  </span>
                </h1>

                <p className="mt-7 max-w-2xl text-sm leading-6 text-white/40">
                  Explore products registered on the ChainTrace
                  supply-chain network. Inspect their origin,
                  ownership, status and blockchain proof.
                </p>

              </div>

              {/* TOTAL */}
              <div className="grid grid-cols-3 border border-white/10 bg-[#081014]">

                <Stat
                  label="Total"
                  value={products.length}
                />

                <Stat
                  label="On-chain"
                  value={blockchainProducts}
                />

                <Stat
                  label="Delivered"
                  value={deliveredProducts}
                />

              </div>

            </div>

          </motion.section>

          {/* ==========================================
              SEARCH + FILTER
          ========================================== */}
          <section className="mt-16 border-y border-white/10 py-5">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              {/* SEARCH */}
              <div className="relative w-full xl:max-w-lg">

                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="text"
                  placeholder="Search product, ID, manufacturer..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="w-full border border-white/10 bg-[#081014] py-3.5 pl-11 pr-11 text-xs text-white outline-none transition placeholder:text-white/25 focus:border-[#36e6ad]/40"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}

              </div>

              {/* FILTER */}
              <div className="flex flex-wrap gap-2">

                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setFilter(item.value)
                    }
                    className={`border px-3 py-2 text-[10px] uppercase tracking-[0.12em] transition ${
                      filter === item.value
                        ? "border-[#36e6ad]/40 bg-[#36e6ad]/10 text-[#36e6ad]"
                        : "border-white/10 text-white/35 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

              </div>

            </div>

            <div className="mt-4 flex items-center justify-between">

              <div className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                {filteredProducts.length}{" "}
                product
                {filteredProducts.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </div>

              {(search || filter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("ALL");
                  }}
                  className="text-[10px] text-[#36e6ad]/70 transition hover:text-[#36e6ad]"
                >
                  Clear filters
                </button>
              )}

            </div>

          </section>

          {/* ==========================================
              LOADING
          ========================================== */}
          {loading && (
            <div className="grid gap-4 pt-8 md:grid-cols-2 lg:grid-cols-3">

              {Array.from({
                length: 6,
              }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}

            </div>
          )}

          {/* ==========================================
              ERROR
          ========================================== */}
          {!loading && error && (
            <div className="mt-10 border border-red-400/20 bg-red-400/5 p-7">

              <div className="flex items-start gap-4">

                <ShieldAlert
                  size={20}
                  className="mt-0.5 text-red-300"
                />

                <div>

                  <p className="text-sm text-red-200">
                    Unable to load products
                  </p>

                  <p className="mt-2 text-xs leading-5 text-red-200/50">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className="mt-5 border border-red-300/20 px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-red-200 transition hover:bg-red-300/10"
                  >
                    Retry
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              EMPTY
          ========================================== */}
          {!loading &&
            !error &&
            filteredProducts.length === 0 && (
              <div className="mt-10 border border-white/10 bg-[#081014] py-24 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center border border-white/10 bg-white/[0.02]">
                  <Package
                    size={25}
                    className="text-white/20"
                  />
                </div>

                <p className="mt-5 text-sm text-white/60">
                  No products found
                </p>

                <p className="mt-2 text-xs text-white/25">
                  Try changing your search or status filter.
                </p>

                {(search || filter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilter("ALL");
                    }}
                    className="mt-5 text-xs text-[#36e6ad] hover:underline"
                  >
                    Clear filters
                  </button>
                )}

              </div>
            )}

          {/* ==========================================
              PRODUCT GRID
          ========================================== */}
          {!loading &&
            !error &&
            filteredProducts.length > 0 && (
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {filteredProducts.map(
                  (product, index) => (
                    <ProductCard
                      key={
                        product._id ||
                        product.productId
                      }
                      product={product}
                      index={index}
                    />
                  )
                )}

              </div>
            )}

        </div>

      </main>

    </div>
  );
}

// ==========================================
// PRODUCT CARD
// ==========================================
function ProductCard({
  product,
  index,
}) {
  const config =
    statusConfig[product.status] ||
    statusConfig.REGISTERED;

  const StatusIcon = config.icon;

  const manufacturer =
    product.manufacturer?.organization ||
    product.manufacturer?.name ||
    "Unknown manufacturer";

  const owner =
    product.currentOwner?.organization ||
    product.currentOwner?.name ||
    "Current owner unavailable";

  const isBlockchainVerified =
    Boolean(product.blockchainTxHash);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.45),
      }}
      whileHover={{
        y: -5,
      }}
      className="group"
    >

      <Link
        to={`/product/${product.productId}`}
        className="relative block h-full overflow-hidden border border-white/10 bg-[#081014] p-5 transition duration-300 hover:border-[#36e6ad]/30 hover:bg-[#091316]"
      >

        {/* GLOW */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#36e6ad]/5 blur-3xl transition duration-500 group-hover:bg-[#36e6ad]/10" />

        {/* TOP */}
        <div className="relative flex items-start justify-between gap-4">

          <div className="min-w-0">

            <p className="text-[9px] uppercase tracking-[0.18em] text-[#36e6ad]">
              {product.category || "Product"}
            </p>

            <h2 className="mt-3 line-clamp-2 text-lg font-medium tracking-tight">
              {product.name}
            </h2>

          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 text-white/25 transition group-hover:border-[#36e6ad]/30 group-hover:text-[#36e6ad]">

            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />

          </div>

        </div>

        {/* PRODUCT ID */}
        <div className="relative mt-6 border-y border-white/10 py-4">

          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
            Product ID
          </p>

          <p className="mt-2 font-mono text-xs text-white/65">
            {product.productId}
          </p>

        </div>

        {/* DETAILS */}
        <div className="relative mt-5 space-y-4">

          <DetailRow
            icon={UserRound}
            label="Manufacturer"
            value={manufacturer}
          />

          <DetailRow
            icon={UserRound}
            label="Current owner"
            value={owner}
          />

          <DetailRow
            icon={MapPin}
            label="Location"
            value={
              product.location ||
              "Location not specified"
            }
          />

        </div>

        {/* STATUS + BLOCKCHAIN */}
        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-2">

          <div
            className={`flex items-center gap-2 border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] ${config.className}`}
          >

            <StatusIcon size={12} />

            {config.label}

          </div>

          {isBlockchainVerified ? (
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-[#36e6ad]">

              <ShieldCheck size={12} />

              On-chain

            </div>
          ) : (
            <div className="text-[9px] uppercase tracking-[0.12em] text-white/20">
              No tx
            </div>
          )}

        </div>

        {/* BOTTOM */}
        <div className="relative mt-5 flex items-center justify-between border-t border-white/5 pt-4">

          <span className="text-[9px] text-white/20">
            ChainTrace registry
          </span>

          <span className="text-[9px] uppercase tracking-[0.12em] text-white/25 transition group-hover:text-[#36e6ad]">
            View details
          </span>

        </div>

      </Link>

    </motion.div>
  );
}

// ==========================================
// DETAIL ROW
// ==========================================
function DetailRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">

      <Icon
        size={13}
        className="mt-0.5 shrink-0 text-white/20"
      />

      <div className="min-w-0">

        <p className="text-[8px] uppercase tracking-[0.15em] text-white/20">
          {label}
        </p>

        <p className="mt-1 truncate text-xs text-white/50">
          {value}
        </p>

      </div>

    </div>
  );
}

// ==========================================
// STAT
// ==========================================
function Stat({
  label,
  value,
}) {
  return (
    <div className="min-w-[75px] border-r border-white/10 px-4 py-3 last:border-r-0 sm:min-w-[90px]">

      <p className="text-[8px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <p className="mt-1.5 text-lg font-medium text-white">
        {value}
      </p>

    </div>
  );
}

// ==========================================
// SKELETON
// ==========================================
function SkeletonCard() {
  return (
    <div className="animate-pulse border border-white/10 bg-[#081014] p-5">

      <div className="flex justify-between">

        <div className="w-full">

          <div className="h-2 w-20 bg-white/5" />

          <div className="mt-4 h-5 w-2/3 bg-white/5" />

        </div>

        <div className="h-8 w-8 bg-white/5" />

      </div>

      <div className="my-6 h-px bg-white/5" />

      <div className="h-2 w-16 bg-white/5" />

      <div className="mt-3 h-3 w-28 bg-white/5" />

      <div className="mt-6 space-y-4">

        <div className="h-8 bg-white/5" />

        <div className="h-8 bg-white/5" />

        <div className="h-8 bg-white/5" />

      </div>

      <div className="mt-6 h-7 w-24 bg-white/5" />

    </div>
  );
}

export default Products;