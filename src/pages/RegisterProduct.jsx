import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";

import api from "../services/api";

function RegisterProduct() {
  const [form, setForm] = useState({
    productId: "",
    name: "",
    description: "",
    category: "",
    location: "",
    productHash: "",
    ipfsHash: "",
    blockchainNetwork: "Ethereum",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [generatedQr, setGeneratedQr] = useState("");
  const [registeredProductId, setRegisteredProductId] = useState("");
  const [blockchainInfo, setBlockchainInfo] = useState(null);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const generateProductId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100 + Math.random() * 900);

    setForm((previous) => ({
      ...previous,
      productId: `CT-${year}-${random}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");
    setGeneratedQr("");
    setRegisteredProductId("");
    setBlockchainInfo(null);

    try {
      const productId = form.productId.trim().toUpperCase();

      if (!productId) {
        throw new Error("Product ID is required.");
      }

      if (!form.name.trim()) {
        throw new Error("Product name is required.");
      }

      if (!form.category.trim()) {
        throw new Error("Product category is required.");
      }

      if (!form.productHash.trim()) {
        throw new Error("Product hash is required.");
      }

      const qrDataUrl = await QRCode.toDataURL(productId, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const productData = {
        productId,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        productHash: form.productHash.trim(),
        ipfsHash: form.ipfsHash.trim(),
        blockchainNetwork: form.blockchainNetwork,
        qrCode: productId,
      };

      const response = await api.post("/products", productData);

      const registeredProduct =
        response.data?.product || response.data?.data || {};

      setSuccess(
        response.data?.message ||
          "Product registered successfully."
      );

      setGeneratedQr(qrDataUrl);
      setRegisteredProductId(productId);

      setBlockchainInfo({
        transactionHash:
          registeredProduct.blockchainTxHash ||
          response.data?.blockchainTxHash ||
          null,
        blockNumber:
          registeredProduct.blockNumber ||
          response.data?.blockNumber ||
          null,
        network:
          registeredProduct.blockchainNetwork ||
          form.blockchainNetwork,
      });

      setForm({
        productId: "",
        name: "",
        description: "",
        category: "",
        location: "",
        productHash: "",
        ipfsHash: "",
        blockchainNetwork: "Ethereum",
      });
    } catch (error) {
      console.error("Product registration error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to register product."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQr = () => {
    if (!generatedQr || !registeredProductId) return;

    const link = document.createElement("a");

    link.href = generatedQr;
    link.download = `${registeredProductId}-QR.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#05090b] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">

          <a
            href="/dashboard"
            className="group flex items-center gap-2 text-xs text-white/40 transition hover:text-[#36e6ad]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to dashboard
          </a>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#36e6ad] text-black">
              <ShieldCheck size={17} />
            </div>

            <span className="text-sm font-semibold tracking-wide">
              chaintrace
            </span>
          </div>

        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">

        {/* HERO */}
        <section className="mb-10">

          <div className="mb-5 flex items-center gap-2 text-[#36e6ad]">
            <Sparkles size={14} />

            <span className="text-[10px] uppercase tracking-[0.3em]">
              Manufacturer Portal
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">
            Register a product.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/35 md:text-base">
            Create a verifiable product identity and connect its
            record with the ChainTrace blockchain verification system.
          </p>

        </section>

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-start gap-3 border border-[#36e6ad]/20 bg-[#36e6ad]/5 p-5">

            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-[#36e6ad]"
            />

            <div>
              <p className="text-sm font-medium text-[#36e6ad]">
                Registration successful
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                {success}
              </p>
            </div>

          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 border border-red-400/20 bg-red-400/5 p-5">

            <p className="text-sm font-medium text-red-300">
              Registration failed
            </p>

            <p className="mt-1 text-xs leading-5 text-red-300/60">
              {error}
            </p>

          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden border border-white/10 bg-[#081014]"
        >

          {/* FORM HEADER */}
          <div className="border-b border-white/10 p-6 md:p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                <FileCheck2 size={18} />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Product information
                </p>

                <p className="mt-1 text-[10px] text-white/30">
                  Enter the information used to create the product record.
                </p>
              </div>

            </div>

          </div>

          <div className="p-6 md:p-8">

            {/* BASIC INFORMATION */}
            <SectionTitle
              number="01"
              title="Basic information"
              description="Identify the physical product."
            />

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {/* PRODUCT ID */}
              <div>

                <div className="flex items-center justify-between">

                  <label className={labelClass}>
                    Product ID
                  </label>

                  <button
                    type="button"
                    onClick={generateProductId}
                    className="text-[9px] uppercase tracking-[0.15em] text-[#36e6ad] transition hover:text-white"
                  >
                    Generate
                  </button>

                </div>

                <input
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  placeholder="CT-2026-014"
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-[10px] text-white/20">
                  Must be unique across ChainTrace.
                </p>

              </div>

              <Field
                label="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Organic Green Tea"
                required
              />

              <Field
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Food & Beverage"
                required
              />

              <Field
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Greater Noida, India"
              />

            </div>

            {/* DESCRIPTION */}
            <div className="mt-6">

              <label
                htmlFor="description"
                className={labelClass}
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the product, batch, specifications, or manufacturing information..."
                className={`${inputClass} resize-none`}
              />

            </div>

            <div className="my-10 border-t border-white/10" />

            {/* VERIFICATION PROOF */}
            <SectionTitle
              number="02"
              title="Verification proof"
              description="Information used to verify product integrity."
            />

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              <Field
                label="Product Hash"
                name="productHash"
                value={form.productHash}
                onChange={handleChange}
                placeholder="hash_ct_2026_014"
                required
              />

              <Field
                label="IPFS Hash"
                name="ipfsHash"
                value={form.ipfsHash}
                onChange={handleChange}
                placeholder="Qm..."
              />

              {/* NETWORK */}
              <div>

                <label className={labelClass}>
                  Blockchain Network
                </label>

                <select
                  name="blockchainNetwork"
                  value={form.blockchainNetwork}
                  onChange={handleChange}
                  className={selectClass}
                >

                  <option
                    value="Ethereum"
                    className="bg-[#081014]"
                  >
                    Ethereum
                  </option>

                  <option
                    value="Polygon"
                    className="bg-[#081014]"
                  >
                    Polygon
                  </option>

                </select>

              </div>

              {/* BLOCKCHAIN TX */}
              <div>

                <label className={labelClass}>
                  Blockchain Transaction
                </label>

                <div className="mt-2 flex min-h-[50px] items-center gap-3 border border-white/10 bg-black/20 px-4">

                  <div className="h-2 w-2 rounded-full bg-[#36e6ad] shadow-[0_0_12px_#36e6ad]" />

                  <span className="text-xs text-white/40">
                    Generated automatically
                  </span>

                </div>

                <p className="mt-2 text-[10px] text-white/20">
                  The blockchain transaction hash is created by the backend.
                </p>

              </div>

            </div>

            <div className="my-10 border-t border-white/10" />

            {/* QR */}
            <SectionTitle
              number="03"
              title="Product QR"
              description="A verification QR will be generated after successful registration."
            />

            <div className="mt-6 border border-white/10 bg-black/20 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                  <QrCode size={19} />
                </div>

                <div>
                  <p className="text-sm">
                    Automatic QR generation
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-white/30">
                    The QR stores the unique Product ID and can be
                    scanned from the ChainTrace verification page.
                  </p>
                </div>

              </div>

            </div>

            {/* SUBMIT */}
            <div className="mt-10 flex flex-col-reverse gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-[10px] leading-5 text-white/20">
                By registering, this product becomes part of the
                ChainTrace verification record.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="group flex shrink-0 items-center justify-center gap-2 bg-[#36e6ad] px-7 py-4 text-xs font-semibold text-black transition hover:bg-[#58f0c0] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Product

                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </>
                )}

              </button>

            </div>

          </div>

        </form>

        {/* RESULT */}
        {generatedQr && (
          <section className="mt-8 overflow-hidden border border-[#36e6ad]/20 bg-[#081014]">

            <div className="border-b border-[#36e6ad]/10 p-6 md:p-8">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Product registered
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    Your product identity and verification QR are ready.
                  </p>
                </div>

              </div>

            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[280px_1fr] md:p-8">

              {/* QR */}
              <div>

                <div className="border border-white/10 bg-white p-5">
                  <img
                    src={generatedQr}
                    alt={`QR code for ${registeredProductId}`}
                    className="h-full w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="mt-4 flex w-full items-center justify-center gap-2 border border-white/10 px-5 py-3 text-xs text-white/60 transition hover:border-[#36e6ad]/40 hover:text-[#36e6ad]"
                >
                  <Download size={14} />
                  Download QR
                </button>

              </div>

              {/* DETAILS */}
              <div>

                <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                  Product ID
                </p>

                <p className="mt-2 text-2xl font-medium text-[#36e6ad]">
                  {registeredProductId}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">

                  <InfoCard
                    label="Verification"
                    value="Ready"
                    accent
                  />

                  <InfoCard
                    label="Network"
                    value={
                      blockchainInfo?.network || "Ethereum"
                    }
                  />

                  <InfoCard
                    label="Block Number"
                    value={
                      blockchainInfo?.blockNumber
                        ? String(blockchainInfo.blockNumber)
                        : "Pending"
                    }
                  />

                  <InfoCard
                    label="Blockchain"
                    value={
                      blockchainInfo?.transactionHash
                        ? "Confirmed"
                        : "Registered"
                    }
                  />

                </div>

                {/* TX */}
                <div className="mt-6 border border-white/10 bg-black/20 p-5">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={15}
                      className="text-[#36e6ad]"
                    />

                    <span className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                      Blockchain transaction
                    </span>

                  </div>

                  <p className="mt-3 break-all font-mono text-[10px] leading-5 text-white/45">
                    {blockchainInfo?.transactionHash ||
                      "Transaction hash will appear here when returned by the backend."}
                  </p>

                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex flex-wrap gap-3">

                  <a
                    href={`/product/${registeredProductId}`}
                    className="flex items-center gap-2 bg-[#36e6ad] px-5 py-3 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
                  >
                    View Product
                    <ArrowUpRight size={14} />
                  </a>

                  <a
                    href="/verify"
                    className="flex items-center gap-2 border border-white/10 px-5 py-3 text-xs text-white/60 transition hover:border-[#36e6ad]/40 hover:text-[#36e6ad]"
                  >
                    Verify Product
                    <ExternalLink size={14} />
                  </a>

                </div>

              </div>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className={labelClass}
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />

    </div>
  );
}

/* =====================================================
   SECTION TITLE
===================================================== */

function SectionTitle({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">

      <span className="font-mono text-[10px] text-[#36e6ad]/60">
        {number}
      </span>

      <div>

        <h2 className="text-sm font-medium">
          {title}
        </h2>

        <p className="mt-1 text-[10px] text-white/25">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({
  label,
  value,
  accent = false,
}) {
  return (
    <div className="border border-white/10 bg-black/20 p-4">

      <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>

      <p
        className={`mt-2 text-sm ${
          accent
            ? "text-[#36e6ad]"
            : "text-white/65"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const labelClass =
  "text-[9px] uppercase tracking-[0.18em] text-white/30";

const inputClass =
  "mt-2 w-full border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-[#36e6ad]/50 focus:bg-[#36e6ad]/[0.02]";

const selectClass =
  "mt-2 w-full border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#36e6ad]/50";

export default RegisterProduct;