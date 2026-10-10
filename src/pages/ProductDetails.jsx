import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Factory,
  MapPin,
  Package,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const statusConfig = {
  REGISTERED: {
    label: "Registered",
    icon: CheckCircle2,
    color: "text-[#36e6ad]",
    border: "border-[#36e6ad]/20",
    bg: "bg-[#36e6ad]/5",
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: Truck,
    color: "text-amber-300",
    border: "border-amber-300/20",
    bg: "bg-amber-300/5",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-[#36e6ad]",
    border: "border-[#36e6ad]/20",
    bg: "bg-[#36e6ad]/5",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: ShieldAlert,
    color: "text-orange-300",
    border: "border-orange-300/20",
    bg: "bg-orange-300/5",
  },
  FLAGGED: {
    label: "Flagged",
    icon: ShieldAlert,
    color: "text-red-300",
    border: "border-red-300/20",
    bg: "bg-red-300/5",
  },
};

const eventConfig = {
  MANUFACTURED: {
    label: "Manufactured",
    icon: Factory,
  },
  REGISTERED: {
    label: "Registered",
    icon: CheckCircle2,
  },
  QUALITY_CHECK: {
    label: "Quality Check",
    icon: ShieldCheck,
  },
  TRANSFERRED: {
    label: "Transferred",
    icon: Truck,
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
  },
  RECEIVED: {
    label: "Received",
    icon: Package,
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
  },
  VERIFIED: {
    label: "Verified",
    icon: ShieldCheck,
  },
};

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [copied, setCopied] = useState(false);
  const [historyRefreshing, setHistoryRefreshing] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setHistoryLoading(true);
        setError("");
        setHistoryError("");

        // Product details
        const productResponse = await api.get(
          `/products/${encodeURIComponent(id)}`
        );

        const productData = productResponse.data.product;

        setProduct(productData);

        // Supply-chain history
        try {
          const historyResponse = await api.get(
            `/supply-chain/${encodeURIComponent(id)}`
          );

          setHistory(historyResponse.data.events || []);
        } catch (historyErr) {
          console.error(
            "Supply-chain history error:",
            historyErr
          );

          setHistoryError(
            historyErr.response?.data?.message ||
              "Unable to load supply-chain history."
          );

          setHistory([]);
        }
      } catch (err) {
        console.error("Product details error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this product."
        );
      } finally {
        setLoading(false);
        setHistoryLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const refreshSupplyChainHistory = async () => {
    if (!id) return;

    try {
      setHistoryRefreshing(true);
      setHistoryError("");

      const response = await api.get(
        `/supply-chain/${encodeURIComponent(id)}`
      );

      setHistory(response.data.events || []);
    } catch (err) {
      console.error("Supply-chain refresh error:", err);

      setHistoryError(
        err.response?.data?.message ||
          "Unable to refresh supply-chain history."
      );
    } finally {
      setHistoryRefreshing(false);
    }
  };

  const copyTransactionHash = async () => {
    if (!product?.blockchainTxHash) return;

    try {
      await navigator.clipboard.writeText(
        product.blockchainTxHash
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05090b] text-white">
        <div className="flex items-center gap-3 text-xs text-white/40">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#36e6ad]" />
          Loading product record...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05090b] px-6 text-white">
        <div className="w-full max-w-lg border border-white/10 bg-[#081014] p-8 text-center">
          <ShieldAlert
            size={30}
            className="mx-auto text-red-300"
          />

          <h1 className="mt-5 text-xl font-medium">
            Product not found
          </h1>

          <p className="mt-3 text-xs leading-6 text-white/35">
            {error ||
              "No product record was found for this Product ID."}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 bg-[#36e6ad] px-5 py-3 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
          >
            <ArrowLeft size={14} />
            Back to registry
          </Link>
        </div>
      </div>
    );
  }

  const config =
    statusConfig[product.status] ||
    statusConfig.REGISTERED;

  const StatusIcon = config.icon;

  const manufacturer =
    product.manufacturer?.organization ||
    product.manufacturer?.name ||
    "Unknown manufacturer";

  const currentOwner =
    product.currentOwner?.organization ||
    product.currentOwner?.name ||
    manufacturer;

  const registeredDate = product.createdAt
    ? new Date(product.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  const hasBlockchainProof = Boolean(
    product.blockchainTxHash
  );

  return (
    <div className="min-h-screen bg-[#05090b] text-white">
      {/* NAVBAR */}
      <header className="border-b border-white/10 bg-[#05090b]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#36e6ad] text-black">
              <Package size={16} />
            </div>

            <span className="text-sm font-semibold tracking-wide">
              chaintrace
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="hidden border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:border-white/30 hover:text-white sm:block"
            >
              Product registry
            </Link>

            <Link
              to="/verify"
              className="bg-[#36e6ad] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
            >
              Verify
            </Link>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-[#36e6ad]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          {/* BACK */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              to="/products"
              className="mb-10 flex w-fit items-center gap-2 text-xs text-white/35 transition hover:text-[#36e6ad]"
            >
              <ArrowLeft size={14} />
              Back to registry
            </Link>
          </motion.div>

          {/* PRODUCT HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="grid gap-10 lg:grid-cols-[1fr_360px]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`flex items-center gap-1.5 border px-3 py-1.5 text-[9px] uppercase tracking-wider ${config.border} ${config.bg} ${config.color}`}
                >
                  <StatusIcon size={12} />
                  {config.label}
                </span>

                <span className="border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/30">
                  {product.category}
                </span>
              </div>

              <div className="mt-7">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#36e6ad]">
                  {product.productId}
                </div>

                <h1 className="mt-3 text-5xl font-medium tracking-[-0.045em] md:text-7xl">
                  {product.name}
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/35">
                  {product.description ||
                    "A registered ChainTrace product with a recorded supply-chain history."}
                </p>
              </div>
            </div>

            {/* VERIFICATION CARD */}
            <div
              className={`border p-6 ${
                hasBlockchainProof
                  ? "border-[#36e6ad]/20 bg-[#36e6ad]/5"
                  : "border-white/10 bg-[#081014]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    hasBlockchainProof
                      ? "bg-[#36e6ad]/10 text-[#36e6ad]"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  {hasBlockchainProof ? (
                    <ShieldCheck
                      size={24}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <ShieldAlert
                      size={24}
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium">
                    {hasBlockchainProof
                      ? "Blockchain proof available"
                      : "Blockchain proof pending"}
                  </div>

                  <div className="mt-1 text-[10px] text-white/30">
                    Product ID: {product.productId}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                  Product status
                </div>

                <div
                  className={`mt-2 text-lg font-medium ${config.color}`}
                >
                  {config.label}
                </div>
              </div>
            </div>
          </motion.div>

          {/* PRODUCT INFORMATION */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16"
          >
            <SectionLabel>
              Product information
            </SectionLabel>

            <div className="mt-5 grid border border-white/10 bg-[#081014] sm:grid-cols-2 lg:grid-cols-4">
              <Info
                label="Manufacturer"
                value={manufacturer}
              />

              <Info
                label="Current owner"
                value={currentOwner}
              />

              <Info
                label="Location"
                value={
                  product.location ||
                  "Location not specified"
                }
              />

              <Info
                label="Registered"
                value={registeredDate}
              />
            </div>
          </motion.section>

          {/* PRODUCT RECORD */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16"
          >
            <SectionLabel>
              Product record
            </SectionLabel>

            <div className="mt-5 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">
              <div className="bg-[#081014] p-6">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                  Product hash
                </div>

                <code className="mt-3 block break-all text-xs text-white/50">
                  {product.productHash || "Not available"}
                </code>
              </div>

              <div className="bg-[#081014] p-6">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                  IPFS hash
                </div>

                <code className="mt-3 block break-all text-xs text-white/50">
                  {product.ipfsHash || "Not available"}
                </code>
              </div>
            </div>
          </motion.section>

          {/* BLOCKCHAIN PROOF */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16"
          >
            <SectionLabel>
              Blockchain proof
            </SectionLabel>

            <div className="mt-5 border border-white/10 bg-[#081014] p-6 md:p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                    Network
                  </div>

                  <div className="mt-2 text-sm">
                    {product.blockchainNetwork ||
                      "Not specified"}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                    Transaction hash
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <code className="break-all text-sm text-[#36e6ad]">
                      {product.blockchainTxHash ||
                        "Not available"}
                    </code>

                    {product.blockchainTxHash && (
                      <button
                        type="button"
                        onClick={copyTransactionHash}
                        className="shrink-0 text-white/30 transition hover:text-[#36e6ad]"
                        title="Copy transaction hash"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>

                  {copied && (
                    <p className="mt-2 text-[9px] text-[#36e6ad]">
                      Copied
                    </p>
                  )}
                </div>
              </div>

              {product.blockchainTxHash && (
                <div className="mt-7 border-t border-white/10 pt-6">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="group flex w-fit items-center gap-2 text-xs text-[#36e6ad]"
                  >
                    View blockchain transaction
                    <ExternalLink
                      size={13}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>

                  <p className="mt-2 text-[10px] text-white/20">
                    Explorer integration will be connected with
                    the selected blockchain network.
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          {/* SUPPLY CHAIN */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <SectionLabel>
                  Supply-chain history
                </SectionLabel>

                <h2 className="mt-3 text-3xl font-medium tracking-tight">
                  Product journey
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-[#36e6ad]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad] shadow-[0_0_10px_#36e6ad]" />
                  Live record
                </div>

                <button
                  type="button"
                  onClick={refreshSupplyChainHistory}
                  disabled={historyRefreshing}
                  className="border border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-white/50 transition hover:border-[#36e6ad]/30 hover:text-[#36e6ad] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {historyRefreshing ? "Refreshing..." : "Refresh history"}
                </button>
              </div>
            </div>

            <div className="relative mt-10">
              {historyLoading ? (
                <div className="border border-white/10 bg-[#081014] p-8">
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[#36e6ad]" />
                    Loading supply-chain history...
                  </div>
                </div>
              ) : historyError ? (
                <div className="border border-orange-300/20 bg-orange-300/5 p-8">
                  <div className="flex items-center gap-3">
                    <ShieldAlert
                      size={18}
                      className="text-orange-300"
                    />

                    <div>
                      <p className="text-sm text-orange-200">
                        Unable to load supply-chain history
                      </p>

                      <p className="mt-2 text-xs text-orange-200/50">
                        {historyError}
                      </p>
                    </div>
                  </div>
                </div>
              ) : history.length === 0 ? (
                <div className="border border-white/10 bg-[#081014] p-8">
                  <div className="flex items-center gap-3">
                    <Clock3
                      size={18}
                      className="text-white/30"
                    />

                    <div>
                      <p className="text-sm text-white/60">
                        No supply-chain events recorded yet
                      </p>

                      <p className="mt-2 text-xs text-white/25">
                        Product journey will appear here once
                        supply-chain events are recorded.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute left-5 top-5 h-[calc(100%-40px)] w-px bg-white/10 md:left-6" />

                  <div className="space-y-5">
                    {history.map((event, index) => {
                      const eventInfo =
                        eventConfig[event.eventType] || {
                          label: event.eventType,
                          icon: Package,
                        };

                      const Icon = eventInfo.icon;

                      const organization =
                        event.fromUser?.organization ||
                        event.fromUser?.name ||
                        "ChainTrace participant";

                      const eventDate = event.timestamp
                        ? new Date(
                            event.timestamp
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Date unavailable";

                      return (
                        <motion.div
                          key={event._id}
                          initial={{
                            opacity: 0,
                            x: -20,
                          }}
                          whileInView={{
                            opacity: 1,
                            x: 0,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                          }}
                          className="relative flex gap-5"
                        >
                          {/* ICON */}
                          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#36e6ad]/30 bg-[#081014] text-[#36e6ad]">
                            <Icon
                              size={16}
                              strokeWidth={1.5}
                            />
                          </div>

                          {/* EVENT CARD */}
                          <div className="flex-1 border border-white/10 bg-[#081014] p-5">
                            <div className="flex flex-col justify-between gap-3 md:flex-row">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-sm font-medium">
                                    {eventInfo.label}
                                  </h3>

                                  <span className="border border-[#36e6ad]/20 bg-[#36e6ad]/5 px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-[#36e6ad]">
                                    {event.eventType}
                                  </span>
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                                  <Factory size={12} />
                                  {organization}
                                </div>

                                {event.toUser && (
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/35">
                                    <Truck size={12} />
                                    <span>Transferred to</span>
                                    <span className="text-white/60">
                                      {event.toUser.organization ||
                                        event.toUser.name ||
                                        "ChainTrace participant"}
                                    </span>
                                  </div>
                                )}

                                {event.description && (
                                  <p className="mt-3 max-w-xl text-xs leading-5 text-white/30">
                                    {event.description}
                                  </p>
                                )}
                              </div>

                              <div className="md:text-right">
                                <div className="flex items-center gap-1.5 text-[10px] text-white/30 md:justify-end">
                                  <MapPin size={11} />
                                  {event.location ||
                                    "Location not specified"}
                                </div>

                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/20 md:justify-end">
                                  <Clock3 size={11} />
                                  {eventDate}
                                </div>
                              </div>
                            </div>

                            {event.blockchainTxHash && (
                              <div className="mt-4 border-t border-white/10 pt-4">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck
                                    size={12}
                                    className="text-[#36e6ad]"
                                  />

                                  <span className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                                    Blockchain transaction
                                  </span>
                                </div>

                                <code className="mt-2 block break-all text-[10px] text-[#36e6ad]/60">
                                  {event.blockchainTxHash}
                                </code>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.section>

          {/* VERIFY CTA */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16 border border-white/10 bg-[#081014] p-8 md:p-10"
          >
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-[#36e6ad]">
                  <ScanLine size={18} />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Verify this product
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-medium tracking-tight">
                  Check another product.
                </h2>

                <p className="mt-2 text-sm text-white/30">
                  Scan a QR code or enter a Product ID to verify
                  its record.
                </p>
              </div>

              <Link
                to="/verify"
                className="group flex w-fit shrink-0 items-center gap-2 bg-[#36e6ad] px-5 py-3 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
              >
                Verify product

                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

/* ====================
   SECTION LABEL
==================== */

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#36e6ad]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />
      {children}
    </div>
  );
}

/* ====================
   INFO
==================== */

function Info({ label, value }) {
  return (
    <div className="border-b border-white/10 p-6 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </div>

      <div className="mt-3 break-words text-sm text-white/70">
        {value}
      </div>
    </div>
  );
}

export default ProductDetails;