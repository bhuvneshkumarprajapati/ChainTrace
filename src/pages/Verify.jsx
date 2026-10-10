import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";

import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Hash,
  PackageCheck,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import api from "../services/api";

function Verify() {
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const [verificationData, setVerificationData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const scannerRef = useRef(null);

  // ==========================================
  // VERIFY PRODUCT
  // ==========================================
  async function verifyProduct(id, scannedValue = "") {
    const normalizedId = String(id || "")
      .trim()
      .toUpperCase();

    if (!normalizedId) {
      setStatus("empty");
      setVerificationData(null);
      setErrorMessage("");
      return;
    }

    setLoading(true);
    setStatus(null);
    setVerificationData(null);
    setErrorMessage("");

    try {
      const payload = {
        productId: normalizedId,
      };

      // QR scanner se value mili hai to backend ko bhejo
      if (scannedValue) {
        payload.scannedHash = String(scannedValue).trim();
      }

      const response = await api.post("/verification", payload);

      const data = response.data;

      console.log("Verification response:", data);

      setProductId(normalizedId);
      setVerificationData(data);

      if (data.result === "AUTHENTIC") {
        setStatus("verified");
      } else if (data.result === "WARNING") {
        setStatus("warning");
      } else {
        setStatus("not-found");
      }
    } catch (error) {
      console.error("Verification error:", error);

      const errorData = error.response?.data || null;

      setVerificationData(errorData);

      if (error.response?.status === 404) {
        setStatus("not-found");
        setErrorMessage(
          errorData?.message ||
            "No registered ChainTrace product was found."
        );
      } else if (error.response?.status === 400) {
        setStatus("warning");
        setErrorMessage(
          errorData?.message ||
            "The scanned product information does not match."
        );
      } else {
        setStatus("error");
        setErrorMessage(
          errorData?.message ||
            "Unable to verify product."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // MANUAL VERIFICATION
  // ==========================================
  async function handleVerify(event) {
    event.preventDefault();

    await verifyProduct(productId);
  }

  // ==========================================
  // DEMO PRODUCT
  // ==========================================
  function handleDemo() {
    setProductId("CT-2026-019");
    setStatus(null);
    setVerificationData(null);
    setErrorMessage("");
  }

  // ==========================================
  // START QR SCANNER
  // ==========================================
  async function startScanner() {
    if (scanning || loading) return;

    setStatus(null);
    setVerificationData(null);
    setErrorMessage("");
    setScanning(true);

    try {
      const qrScanner = new Html5Qrcode("qr-reader");

      scannerRef.current = qrScanner;

      await qrScanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 220,
            height: 220,
          },
        },
        async (decodedText) => {
          console.log("QR detected:", decodedText);

          await stopScanner();

          const scannedValue = decodedText.trim();

          /*
           * ChainTrace QR normally contains Product ID.
           *
           * Example:
           * CT-2026-019
           *
           * Backend receives:
           * {
           *   productId: "CT-2026-019",
           *   scannedHash: "CT-2026-019"
           * }
           */

          const scannedProductId = scannedValue.toUpperCase();

          setProductId(scannedProductId);

          await verifyProduct(
            scannedProductId,
            scannedValue
          );
        },
        () => {
          // Ignore normal QR scanning frame errors
        }
      );
    } catch (error) {
      console.error("QR scanner error:", error);

      setScanning(false);
      scannerRef.current = null;

      setStatus("error");

      setErrorMessage(
        "Unable to access camera. Please allow camera permission and try again."
      );
    }
  }

  // ==========================================
  // STOP QR SCANNER
  // ==========================================
  async function stopScanner() {
    const currentScanner = scannerRef.current;

    if (!currentScanner) {
      setScanning(false);
      return;
    }

    try {
      await currentScanner.stop();
    } catch (error) {
      console.error("Scanner stop error:", error);
    }

    try {
      currentScanner.clear();
    } catch (error) {
      console.error("Scanner clear error:", error);
    }

    scannerRef.current = null;
    setScanning(false);
  }

  // ==========================================
  // CLEANUP
  // ==========================================
  useEffect(() => {
    return () => {
      const cleanupScanner = async () => {
        const currentScanner = scannerRef.current;

        if (!currentScanner) return;

        try {
          await currentScanner.stop();
        } catch (error) {
          console.error(error);
        }

        try {
          currentScanner.clear();
        } catch (error) {
          console.error(error);
        }

        scannerRef.current = null;
      };

      cleanupScanner();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#05090b] text-white">

      {/* NAVBAR */}
      <header className="border-b border-white/10 bg-[#05090b]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <a
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#36e6ad] text-black">
              <ShieldCheck size={16} />
            </div>

            <span className="text-sm font-semibold tracking-wide">
              chaintrace
            </span>
          </a>

          <div className="flex items-center gap-3">

            <a
              href="/products"
              className="hidden border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:border-white/30 hover:text-white sm:block"
            >
              Product registry
            </a>

            <a
              href="/login"
              className="bg-[#36e6ad] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
            >
              Sign in
            </a>

          </div>
        </div>
      </header>

      {/* PAGE */}
      <main className="relative overflow-hidden">

        <div className="pointer-events-none absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16">

          {/* BACK */}
          <a
            href="/"
            className="flex w-fit items-center gap-2 text-xs text-white/35 transition hover:text-[#36e6ad]"
          >
            <ArrowLeft size={14} />
            Back to ChainTrace
          </a>

          {/* HEADER */}
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
              duration: 0.7,
            }}
            className="mt-12 max-w-3xl"
          >
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#36e6ad]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />
              Product verification
            </div>

            <h1 className="text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Verify what
              <br />
              <span className="text-[#36e6ad]">
                you are buying.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-6 text-white/40">
              Enter a unique Product ID or scan its QR code to check the
              registered product record and its blockchain proof.
            </p>
          </motion.div>

          {/* VERIFICATION AREA */}
          <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_380px]">

            {/* LEFT */}
            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.1,
              }}
              className="border border-white/10 bg-[#081014] p-7 md:p-9"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                  <Hash size={19} />
                </div>

                <div>
                  <div className="text-sm font-medium">
                    Enter Product ID
                  </div>

                  <div className="mt-1 text-[10px] text-white/25">
                    Use the ID printed on the product or package.
                  </div>
                </div>

              </div>

              <form
                onSubmit={handleVerify}
                className="mt-8"
              >

                <label className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                  Product ID
                </label>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">

                  <input
                    value={productId}
                    onChange={(event) => {
                      setProductId(event.target.value);

                      setStatus(null);
                      setVerificationData(null);
                      setErrorMessage("");
                    }}
                    placeholder="CT-2026-XXXX"
                    className="min-w-0 flex-1 border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex items-center justify-center gap-2 bg-[#36e6ad] px-6 py-4 text-xs font-semibold text-black transition hover:bg-[#58f0c0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify"}

                    {!loading && (
                      <ArrowUpRight
                        size={15}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    )}
                  </button>

                </div>

              </form>

              {/* DEMO */}
              <button
                type="button"
                onClick={handleDemo}
                className="mt-4 text-[10px] text-[#36e6ad]/70 transition hover:text-[#36e6ad]"
              >
                Use registered product: CT-2026-019
              </button>

              {/* RESULT */}
              {status && (
                <VerificationResult
                  status={status}
                  message={errorMessage}
                  riskLevel={verificationData?.riskLevel}
                />
              )}

            </motion.div>

            {/* QR */}
            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.2,
              }}
              className="border border-white/10 bg-[#081014] p-7"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                  <ScanLine size={19} />
                </div>

                <div>
                  <div className="text-sm font-medium">
                    Scan QR code
                  </div>

                  <div className="mt-1 text-[10px] text-white/25">
                    Quickly verify from your camera.
                  </div>
                </div>

              </div>

              {/* SCANNER */}
              <div className="relative mt-8 aspect-square overflow-hidden border border-dashed border-white/10 bg-black/20">

                <div className="pointer-events-none absolute left-5 top-5 z-20 h-7 w-7 border-l border-t border-[#36e6ad]" />

                <div className="pointer-events-none absolute right-5 top-5 z-20 h-7 w-7 border-r border-t border-[#36e6ad]" />

                <div className="pointer-events-none absolute bottom-5 left-5 z-20 h-7 w-7 border-b border-l border-[#36e6ad]" />

                <div className="pointer-events-none absolute bottom-5 right-5 z-20 h-7 w-7 border-b border-r border-[#36e6ad]" />

                <div
                  id="qr-reader"
                  className="h-full w-full overflow-hidden"
                />

                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">

                      <ScanLine
                        size={42}
                        strokeWidth={1}
                        className="mx-auto text-white/20"
                      />

                      <div className="mt-4 text-xs text-white/30">
                        Position QR code inside the frame
                      </div>

                    </div>
                  </div>
                )}

                {scanning && (
                  <>
                    <motion.div
                      initial={{
                        y: -80,
                      }}
                      animate={{
                        y: 80,
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="pointer-events-none absolute left-8 right-8 top-1/2 z-20 h-px bg-[#36e6ad] shadow-[0_0_12px_#36e6ad]"
                    />

                    <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[10px] text-[#36e6ad]">
                      Scanning QR...
                    </div>
                  </>
                )}

              </div>

              <button
                type="button"
                onClick={
                  scanning
                    ? stopScanner
                    : startScanner
                }
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 border border-white/10 px-5 py-3 text-xs text-white/50 transition hover:border-[#36e6ad]/40 hover:text-[#36e6ad] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ScanLine size={14} />

                {scanning
                  ? "Stop scanner"
                  : "Start scanner"}
              </button>

            </motion.div>

          </div>

          {/* VERIFIED PRODUCT */}
          {verificationData?.product && (
            <VerifiedProduct
              data={verificationData}
            />
          )}

        </div>
      </main>
    </div>
  );
}

// ==========================================
// VERIFICATION RESULT
// ==========================================
function VerificationResult({
  status,
  message,
  riskLevel,
}) {
  if (status === "empty") {
    return (
      <div className="mt-8 border border-yellow-400/20 bg-yellow-400/5 p-5">
        <div className="flex items-center gap-3">

          <Clock3
            size={20}
            className="text-yellow-400"
          />

          <div>
            <div className="text-sm font-medium text-yellow-400">
              Product ID required
            </div>

            <div className="mt-1 text-xs text-white/30">
              Enter a Product ID before starting verification.
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="mt-8 border border-red-400/20 bg-red-400/5 p-5">
        <div className="flex items-center gap-3">

          <XCircle
            size={20}
            className="text-red-400"
          />

          <div>
            <div className="text-sm font-medium text-red-400">
              Product not verified
            </div>

            <div className="mt-1 text-xs text-white/30">
              {message ||
                "No registered ChainTrace record was found for this ID."}
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (status === "warning") {
    return (
      <div className="mt-8 border border-yellow-400/20 bg-yellow-400/5 p-5">
        <div className="flex items-center gap-3">

          <ShieldAlert
            size={21}
            className="text-yellow-400"
          />

          <div>
            <div className="text-sm font-medium text-yellow-400">
              Verification requires review
            </div>

            <div className="mt-1 text-xs text-white/30">
              {message
                ? message
                : `Risk level: ${riskLevel || "MEDIUM"}`}
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-8 border border-red-400/20 bg-red-400/5 p-5">
        <div className="flex items-center gap-3">

          <ShieldAlert
            size={20}
            className="text-red-400"
          />

          <div>
            <div className="text-sm font-medium text-red-400">
              Verification error
            </div>

            <div className="mt-1 text-xs text-white/30">
              {message ||
                "Unable to verify this product."}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-[#36e6ad]/20 bg-[#36e6ad]/5 p-5">
      <div className="flex items-center gap-3">

        <CheckCircle2
          size={21}
          className="text-[#36e6ad]"
        />

        <div>
          <div className="text-sm font-medium text-[#36e6ad]">
            Authentic product record found
          </div>

          <div className="mt-1 text-xs text-white/30">
            Blockchain, ownership and product verification checks matched.
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// VERIFIED PRODUCT
// ==========================================
function VerifiedProduct({ data }) {
  const product = data.product;
  const proof = data.proof;

  const manufacturerName =
    product.manufacturer?.organization ||
    product.manufacturer?.name ||
    "Unknown manufacturer";

  const ownerName =
    product.currentOwner?.organization ||
    product.currentOwner?.name ||
    "Unknown owner";

  const productIdentifier =
    product.productId ||
    product.id ||
    "Unknown";

  const registeredDate =
    data.verification?.createdAt
      ? new Date(
          data.verification.createdAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )
      : "Not available";

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.7,
      }}
      className="mt-16"
    >

      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#36e6ad]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#36e6ad]" />
        Verification result
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px]">

        {/* PRODUCT */}
        <div className="border border-white/10 bg-[#081014] p-7 md:p-9">

          <div className="flex flex-col justify-between gap-5 sm:flex-row">

            <div>

              <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                Product ID
              </div>

              <h2 className="mt-2 text-3xl font-medium tracking-tight">
                {product.name}
              </h2>

              <p className="mt-2 text-sm text-white/35">
                {manufacturerName}
              </p>

            </div>

            <div
              className={`flex h-fit items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-wider ${
                data.result === "AUTHENTIC"
                  ? "border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]"
                  : "border-yellow-400/20 bg-yellow-400/5 text-yellow-400"
              }`}
            >

              {data.result === "AUTHENTIC" ? (
                <CheckCircle2 size={13} />
              ) : (
                <ShieldAlert size={13} />
              )}

              {data.result}

            </div>

          </div>

          <div className="mt-8 grid border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">

            <Detail
              label="Product ID"
              value={productIdentifier}
            />

            <Detail
              label="Current owner"
              value={ownerName}
            />

            <Detail
              label="Location"
              value={
                product.location ||
                "Not available"
              }
            />

            <Detail
              label="Registered"
              value={registeredDate}
            />

            <Detail
              label="Category"
              value={
                product.category ||
                "Not available"
              }
            />

            <Detail
              label="Status"
              value={
                product.status ||
                "Not available"
              }
            />

            <Detail
              label="Network"
              value={
                product.blockchainNetwork ||
                "Not available"
              }
            />

          </div>

        </div>

        {/* PROOF */}
        <div className="border border-white/10 bg-[#081014] p-7">

          <div className="flex items-center gap-2 text-[#36e6ad]">

            <ShieldCheck size={18} />

            <span className="text-sm font-medium">
              Verification proof
            </span>

          </div>

          <div className="mt-7">

            <ProofRow
              label="Hash match"
              valid={proof?.hashMatches}
            />

            <ProofRow
              label="QR match"
              valid={proof?.qrMatches}
            />

            <ProofRow
              label="Blockchain proof"
              valid={proof?.blockchainVerified}
            />

            <ProofRow
              label="Ownership"
              valid={proof?.ownershipValid}
            />

            <ProofRow
              label="Manufacturer"
              valid={proof?.manufacturerValid}
            />

          </div>

          {proof?.blockchainCurrentOwner && (
            <div className="mt-7">

              <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                Blockchain owner
              </div>

              <code className="mt-2 block break-all text-[10px] text-white/40">
                {proof.blockchainCurrentOwner}
              </code>

            </div>
          )}

          {product.blockchainTxHash && (
            <div className="mt-7">

              <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                Transaction
              </div>

              <code className="mt-2 block break-all text-xs text-[#36e6ad]">
                {product.blockchainTxHash}
              </code>

            </div>
          )}

          <a
            href={`/product/${productIdentifier}`}
            className="group mt-7 flex items-center gap-2 text-xs text-[#36e6ad]"
          >
            View full product history

            <ArrowUpRight
              size={13}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>

        </div>

      </div>

      {/* STATUS */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        <StatusCard
          icon={PackageCheck}
          title="Product registered"
          text="Valid ChainTrace record"
          valid={true}
        />

        <StatusCard
          icon={ShieldCheck}
          title="Proof verified"
          text={
            proof?.blockchainVerified
              ? "Blockchain proof available"
              : "Blockchain proof unavailable"
          }
          valid={proof?.blockchainVerified}
        />

        <StatusCard
          icon={CheckCircle2}
          title="Ownership valid"
          text={
            proof?.ownershipValid
              ? "Current owner matches blockchain"
              : "Ownership mismatch"
          }
          valid={proof?.ownershipValid}
        />

      </div>

    </motion.section>
  );
}

// ==========================================
// DETAIL
// ==========================================
function Detail({
  label,
  value,
}) {
  return (
    <div className="mb-5 sm:mb-0">

      <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </div>

      <div className="mt-2 text-xs text-white/60">
        {value}
      </div>

    </div>
  );
}

// ==========================================
// PROOF ROW
// ==========================================
function ProofRow({
  label,
  valid,
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3">

      <span className="text-xs text-white/50">
        {label}
      </span>

      {valid ? (
        <span className="flex items-center gap-1.5 text-[10px] text-[#36e6ad]">
          <CheckCircle2 size={13} />
          Valid
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-[10px] text-red-400">
          <XCircle size={13} />
          Invalid
        </span>
      )}

    </div>
  );
}

// ==========================================
// STATUS CARD
// ==========================================
function StatusCard({
  icon: Icon,
  title,
  text,
  valid,
}) {
  return (
    <div className="flex items-center gap-4 border border-white/10 bg-[#081014] p-5">

      <div
        className={`flex h-9 w-9 items-center justify-center border ${
          valid
            ? "border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]"
            : "border-yellow-400/20 bg-yellow-400/5 text-yellow-400"
        }`}
      >
        <Icon size={16} />
      </div>

      <div>

        <div className="text-xs font-medium">
          {title}
        </div>

        <div className="mt-1 text-[10px] text-white/25">
          {text}
        </div>

      </div>

    </div>
  );
}

export default Verify;