import { useEffect, useMemo, useState } from "react";

import { Navigate, Link } from "react-router-dom";

import {

  ArrowRight,

  Box,

  CheckCircle2,

  Copy,

  ExternalLink,

  LogOut,

  Package,

  RefreshCw,

  ShieldCheck,

  Truck,

  UserRound,

  Wallet,

  XCircle,

  Activity,

  Blocks,

} from "lucide-react";



import api from "../services/api";
import NotificationBell from "../components/NotificationBell";



const roleConfig = {

  ADMIN: {

    label: "Administrator",

    icon: ShieldCheck,

  },

  MANUFACTURER: {

    label: "Manufacturer",

    icon: Package,

  },

  SUPPLIER: {

    label: "Supplier",

    icon: Box,

  },

  DISTRIBUTOR: {

    label: "Distributor",

    icon: Truck,

  },

  RETAILER: {

    label: "Retailer",

    icon: Package,

  },

  CUSTOMER: {

    label: "Customer",

    icon: UserRound,

  },

};



function StatCard({ icon: Icon, label, value, description }) {

  return (

    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">

        <Icon size={19} className="text-emerald-300" />

      </div>



      <p className="text-sm text-zinc-400">{label}</p>



      <p className="mt-1 text-3xl font-semibold tracking-tight text-white">

        {value}

      </p>



      <p className="mt-2 text-xs text-zinc-500">{description}</p>

    </div>

  );

}



function InfoCard({ label, value, mono = false }) {

  return (

    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">

        {label}

      </p>



      <p

        className={`mt-3 break-all text-sm text-zinc-200 ${

          mono ? "font-mono text-xs" : ""

        }`}

      >

        {value || "Not available"}

      </p>

    </div>

  );

}



function StatusBadge({ status }) {

  const styles = {

    REGISTERED:

      "border-blue-400/20 bg-blue-400/10 text-blue-300",

    IN_TRANSIT:

      "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",

    DELIVERED:

      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

    UNDER_REVIEW:

      "border-orange-400/20 bg-orange-400/10 text-orange-300",

    FLAGGED:

      "border-red-400/20 bg-red-400/10 text-red-300",

  };



  return (

    <span

      className={`rounded-full border px-3 py-1 text-[11px] font-medium ${

        styles[status] ||

        "border-white/10 bg-white/5 text-zinc-300"

      }`}

    >

      {status || "UNKNOWN"}

    </span>

  );

}



function EventBadge({ eventType }) {

  const isDelivered = eventType === "DELIVERED";



  return (

    <span

      className={`rounded-full border px-3 py-1 text-[10px] font-medium ${

        isDelivered

          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"

          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"

      }`}

    >

      {eventType || "EVENT"}

    </span>

  );

}



function shortenHash(hash) {

  if (!hash) return "N/A";



  if (hash.length <= 18) {

    return hash;

  }



  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;

}



function formatDate(date) {

  if (!date) return "Unknown";



  return new Date(date).toLocaleString("en-IN", {

    dateStyle: "medium",

    timeStyle: "short",

  });

}



export default function Dashboard() {

  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);

  const [activity, setActivity] = useState([]);



  const [loading, setLoading] = useState(true);

  const [productsLoading, setProductsLoading] = useState(true);

  const [activityLoading, setActivityLoading] = useState(true);



  const [error, setError] = useState("");

  const [transferError, setTransferError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");



  const [transferResult, setTransferResult] = useState(null);



  const [transferData, setTransferData] = useState({

    productId: "",

    toUser: "",

    location: "",

    description: "",

  });



  useEffect(() => {

    fetchDashboard();

  }, []);



  const fetchDashboard = async () => {

    try {

      setLoading(true);

      setError("");



      const [

        userResponse,

        productsResponse,

        activityResponse,

      ] = await Promise.all([

        api.get("/users/me"),

        api.get("/products"),

        api.get("/supply-chain/activity/recent"),

      ]);



      setUser(userResponse.data.user);



      setProducts(

        productsResponse.data.products || []

      );



      setActivity(

        activityResponse.data.events || []

      );

    } catch (err) {

      console.error(err);



      if (err.response?.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

      } else {

        setError(

          err.response?.data?.message ||

            "Failed to load dashboard."

        );

      }

    } finally {

      setLoading(false);

      setProductsLoading(false);

      setActivityLoading(false);

    }

  };



  const refreshProducts = async () => {

    try {

      setProductsLoading(true);



      const response = await api.get("/products");



      setProducts(

        response.data.products || []

      );

    } catch (err) {

      console.error(err);

    } finally {

      setProductsLoading(false);

    }

  };



  const refreshActivity = async () => {

    try {

      setActivityLoading(true);



      const response = await api.get(

        "/supply-chain/activity/recent"

      );



      setActivity(

        response.data.events || []

      );

    } catch (err) {

      console.error(err);



      setError(

        err.response?.data?.message ||

          "Failed to refresh blockchain activity."

      );

    } finally {

      setActivityLoading(false);

    }

  };



  const handleChange = (event) => {

    const { name, value } = event.target;



    setTransferData((prev) => ({

      ...prev,

      [name]: value,

    }));

  };



  const handleTransfer = async (event) => {

    event.preventDefault();



    setTransferError("");

    setSuccessMessage("");

    setTransferResult(null);



    try {

      const response = await api.post(

        "/supply-chain/transfer",

        transferData

      );



      const result = response.data;



      setSuccessMessage(

        result.message ||

          "Product transferred successfully."

      );



      setTransferResult(result);



      setTransferData({

        productId: "",

        toUser: "",

        location: "",

        description: "",

      });



      await refreshProducts();

      await refreshActivity();

    } catch (err) {

      console.error(err);



      setTransferError(

        err.response?.data?.message ||

          "Product transfer failed."

      );

    }

  };



  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");



    window.location.href = "/login";

  };



  const copyWallet = async () => {

    if (!user?.walletAddress) return;

    setTransferError("");

    setSuccessMessage("");



    try {

      await navigator.clipboard.writeText(

        user.walletAddress

      );



      setSuccessMessage(

        "Wallet address copied."

      );

    } catch {

      setTransferError(

        "Unable to copy wallet address. Please copy it manually."

      );

    }

  };



  const copyTransaction = async (hash) => {

    if (!hash) return;

    setTransferError("");

    setSuccessMessage("");



    try {

      await navigator.clipboard.writeText(hash);



      setSuccessMessage(

        "Transaction hash copied."

      );

    } catch {

      setTransferError(

        "Unable to copy transaction hash. Please copy it manually."

      );

    }

  };



  const role = user?.role || "CUSTOMER";



  const RoleIcon =

    roleConfig[role]?.icon || UserRound;



  const canTransfer = [

    "ADMIN",

    "MANUFACTURER",

    "SUPPLIER",

    "DISTRIBUTOR",

    "RETAILER",

  ].includes(role);



  const dashboardStats = useMemo(() => {

    const total = products.length;



    const onChain = products.filter(

      (product) => product.blockchainTxHash

    ).length;



    const delivered = products.filter(

      (product) =>

        product.status === "DELIVERED"

    ).length;



    const owned = products.filter(

      (product) =>

        product.currentOwner?._id === user?._id ||

        product.currentOwner?.id === user?._id

    ).length;



    return {

      total,

      onChain,

      delivered,

      owned,

    };

  }, [products, user]);



  const recentProducts = useMemo(() => {

    return [...products]

      .sort(

        (a, b) =>

          new Date(b.createdAt || 0) -

          new Date(a.createdAt || 0)

      )

      .slice(0, 5);

  }, [products]);



  if (loading) {

    return (

      <div className="min-h-screen bg-[#05070a] text-white">

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

          <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />



          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {Array.from({ length: 4 }).map(

              (_, index) => (

                <div

                  key={index}

                  className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"

                />

              )

            )}

          </div>



          <div className="mt-8 h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />

        </div>

      </div>

    );

  }



  if (!user) {

    return <Navigate to="/login" replace />;

  }



  return (

    <div className="min-h-screen bg-[#05070a] text-white">

      {/* Background */}



      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-[140px]" />



        <div className="absolute bottom-[-200px] right-[-100px] h-[450px] w-[450px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />

      </div>



      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* Header */}



        <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />



              ChainTrace Dashboard

            </div>



            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">

              Welcome, {user.name}

            </h1>



            <p className="mt-2 text-sm text-zinc-400">

              Manage your supply-chain activity from one

              place.

            </p>

          </div>



          <div className="flex items-center gap-3">




            <NotificationBell />





            <button




              onClick={logout}




              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300"




            >




              <LogOut size={16} />




              Logout




            </button>




          </div>

        </header>



        {/* Errors */}



        {error && (

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-4 text-sm text-red-300">

            <XCircle size={18} />



            {error}

          </div>

        )}



        {successMessage && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-4 text-sm text-emerald-300">

            <CheckCircle2

              size={18}

              className="mt-0.5 shrink-0"

            />



            <div>

              <p>{successMessage}</p>



              {transferResult?.blockchain

                ?.transactionHash && (

                <p className="mt-2 break-all font-mono text-xs text-emerald-400/70">

                  TX:{" "}

                  {

                    transferResult.blockchain

                      .transactionHash

                  }

                </p>

              )}



              {transferResult?.blockchain

                ?.blockNumber !== undefined && (

                <p className="mt-1 text-xs text-emerald-400/70">

                  Block:{" "}

                  {

                    transferResult.blockchain

                      .blockNumber

                  }

                </p>

              )}

            </div>

          </div>

        )}



        {transferError && (

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-4 text-sm text-red-300">

            <XCircle size={18} />



            {transferError}

          </div>

        )}



        {/* Role Banner */}



        <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]">

          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-5">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">

                <RoleIcon

                  size={25}

                  className="text-emerald-300"

                />

              </div>



              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">

                  Current Role

                </p>



                <h2 className="mt-1 text-xl font-semibold">

                  {roleConfig[role]?.label || role}

                </h2>



                <p className="mt-1 text-sm text-zinc-400">

                  {user.organization ||

                    "Independent ChainTrace account"}

                </p>

              </div>

            </div>



            <div className="flex flex-wrap gap-3">

              <Link

                to="/verify"

                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"

              >

                Verify Product



                <ArrowRight size={15} />

              </Link>



              {role === "MANUFACTURER" && (

                <Link

                  to="/dashboard/manufacturer/register-product"

                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15"

                >

                  Register Product



                  <Package size={15} />

                </Link>

              )}

            </div>

          </div>

        </section>



        {/* Stats */}



        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard

            icon={Package}

            label="Total Products"

            value={dashboardStats.total}

            description="Products currently available"

          />



          <StatCard

            icon={ShieldCheck}

            label="On Blockchain"

            value={dashboardStats.onChain}

            description="Products with blockchain proof"

          />



          <StatCard

            icon={CheckCircle2}

            label="Delivered"

            value={dashboardStats.delivered}

            description="Products marked delivered"

          />



          <StatCard

            icon={Wallet}

            label="My Products"

            value={dashboardStats.owned}

            description="Products currently owned"

          />

        </section>



        {/* Account + Wallet */}



        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          <div>

            <div className="mb-4">

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">

                Account

              </p>



              <h2 className="mt-1 text-xl font-semibold">

                Account Information

              </h2>

            </div>



            <div className="grid gap-4 sm:grid-cols-2">

              <InfoCard

                label="Name"

                value={user.name}

              />



              <InfoCard

                label="Email"

                value={user.email}

              />



              <InfoCard

                label="Organization"

                value={user.organization}

              />



              <InfoCard

                label="Role"

                value={role}

              />

            </div>

          </div>



          <div>

            <div className="mb-4 flex items-end justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">

                  Blockchain Identity

                </p>



                <h2 className="mt-1 text-xl font-semibold">

                  Wallet

                </h2>

              </div>



              {user.walletAddress && (

                <button

                  onClick={copyWallet}

                  className="inline-flex items-center gap-2 text-xs text-zinc-400 transition hover:text-white"

                >

                  <Copy size={14} />

                  Copy

                </button>

              )}

            </div>



            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">

                  <Wallet

                    size={18}

                    className="text-emerald-300"

                  />

                </div>



                <div>

                  <p className="text-xs text-zinc-500">

                    Connected Wallet

                  </p>



                  <p className="mt-1 text-xs text-emerald-300">

                    Local Hardhat Network

                  </p>

                </div>

              </div>



              <p className="mt-5 break-all font-mono text-xs leading-6 text-zinc-300">

                {user.walletAddress ||

                  "No wallet address configured"}

              </p>

            </div>

          </div>

        </section>



        {/* Transfer */}



        {canTransfer && (

          <section className="mt-8">

            <div className="mb-4">

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">

                Supply Chain

              </p>



              <h2 className="mt-1 text-xl font-semibold">

                Transfer Product

              </h2>



              <p className="mt-2 max-w-2xl text-sm text-zinc-500">

                Transfer ownership to another registered

                ChainTrace user. The blockchain transaction is

                created automatically.

              </p>

            </div>



            <form

              onSubmit={handleTransfer}

              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"

            >

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm text-zinc-300">

                    Product ID

                  </label>



                  <input

                    type="text"

                    name="productId"

                    value={transferData.productId}

                    onChange={handleChange}

                    placeholder="CT-2026-016"

                    required

                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40"

                  />

                </div>



                <div>

                  <label className="mb-2 block text-sm text-zinc-300">

                    Receiver User ID

                  </label>



                  <input

                    type="text"

                    name="toUser"

                    value={transferData.toUser}

                    onChange={handleChange}

                    placeholder="MongoDB User ID"

                    required

                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40"

                  />



                  <p className="mt-2 text-xs text-zinc-600">

                    Use the registered receiver's ChainTrace

                    User ID.

                  </p>

                </div>



                <div>

                  <label className="mb-2 block text-sm text-zinc-300">

                    Location

                  </label>



                  <input

                    type="text"

                    name="location"

                    value={transferData.location}

                    onChange={handleChange}

                    placeholder="Bilari"

                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40"

                  />

                </div>



                <div>

                  <label className="mb-2 block text-sm text-zinc-300">

                    Description

                  </label>



                  <input

                    type="text"

                    name="description"

                    value={transferData.description}

                    onChange={handleChange}

                    placeholder="Transferred to distributor"

                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40"

                  />

                </div>

              </div>



              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex gap-3">

                  <ShieldCheck

                    size={19}

                    className="mt-0.5 shrink-0 text-emerald-300"

                  />



                  <div>

                    <p className="text-sm text-zinc-200">

                      Blockchain transaction

                    </p>



                    <p className="mt-1 text-xs text-zinc-500">

                      ChainTrace will automatically create and

                      store the transaction hash.

                    </p>

                  </div>

                </div>



                <button

                  type="submit"

                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"

                >

                  Transfer Product



                  <ArrowRight size={16} />

                </button>

              </div>

            </form>

          </section>

        )}



        {/* ================================ */}

        {/* BLOCKCHAIN ACTIVITY */}

        {/* ================================ */}



        <section className="mt-10">

          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">

                  Blockchain

                </p>



                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300">

                  LIVE DATA

                </span>

              </div>



              <h2 className="mt-1 text-xl font-semibold">

                Recent Blockchain Activity

              </h2>



              <p className="mt-2 text-sm text-zinc-500">

                Latest supply-chain events recorded on the

                blockchain.

              </p>

            </div>



            <button

              onClick={refreshActivity}

              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:text-white"

            >

              <RefreshCw

                size={14}

                className={

                  activityLoading

                    ? "animate-spin"

                    : ""

                }

              />



              Refresh Activity

            </button>

          </div>



          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

            {activityLoading ? (

              <div className="space-y-3 p-5">

                {Array.from({ length: 4 }).map(

                  (_, index) => (

                    <div

                      key={index}

                      className="h-24 animate-pulse rounded-2xl bg-white/5"

                    />

                  )

                )}

              </div>

            ) : activity.length === 0 ? (

              <div className="px-6 py-16 text-center">

                <Blocks

                  size={32}

                  className="mx-auto text-zinc-600"

                />



                <p className="mt-4 text-sm text-zinc-400">

                  No blockchain activity found.

                </p>



                <p className="mt-2 text-xs text-zinc-600">

                  Product transfers will appear here after

                  an on-chain transaction.

                </p>

              </div>

            ) : (

              <div className="divide-y divide-white/10">

                {activity.map((event) => (

                  <div

                    key={event._id}

                    className="p-5 transition hover:bg-white/[0.02]"

                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* Left */}



                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06]">

                          <Activity

                            size={18}

                            className="text-emerald-300"

                          />

                        </div>



                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <Link

                              to={

                                event.product?.productId

                                  ? `/product/${event.product.productId}`

                                  : "/products"

                              }

                              className="font-mono text-sm font-medium text-white transition hover:text-emerald-300"

                            >

                              {event.product?.productId ||

                                "Unknown Product"}

                            </Link>



                            <EventBadge

                              eventType={

                                event.eventType

                              }

                            />

                          </div>



                          <p className="mt-1 text-sm text-zinc-400">

                            {event.description ||

                              "Supply-chain blockchain event"}

                          </p>



                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">

                            <span>

                              {formatDate(

                                event.timestamp ||

                                  event.createdAt

                              )}

                            </span>



                            {event.location && (

                              <span>

                                Location:{" "}

                                {event.location}

                              </span>

                            )}

                          </div>

                        </div>

                      </div>



                      {/* Right */}



                      <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[430px]">

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                          <div className="flex items-center justify-between">

                            <p className="text-[10px] uppercase tracking-wider text-zinc-600">

                              Transaction

                            </p>



                            <button

                              onClick={() =>

                                copyTransaction(

                                  event.blockchainTxHash

                                )

                              }

                              className="text-zinc-500 transition hover:text-white"

                              title="Copy transaction hash"

                            >

                              <Copy size={13} />

                            </button>

                          </div>



                          <p className="mt-2 font-mono text-xs text-emerald-300">

                            {shortenHash(

                              event.blockchainTxHash

                            )}

                          </p>

                        </div>



                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">

                          <p className="text-[10px] uppercase tracking-wider text-zinc-600">

                            Block

                          </p>



                          <p className="mt-2 flex items-center gap-2 font-mono text-xs text-zinc-300">

                            <Blocks size={13} />



                            {event.blockNumber ??

                              "Pending"}

                          </p>

                        </div>



                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 sm:col-span-2">

                          <p className="text-[10px] uppercase tracking-wider text-zinc-600">

                            Ownership Transfer

                          </p>



                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">

                            <span className="rounded-lg bg-white/5 px-2 py-1 text-zinc-400">

                              {event.fromUser?.name ||

                                "Unknown"}

                            </span>



                            <ArrowRight

                              size={13}

                              className="text-emerald-400"

                            />



                            <span className="rounded-lg bg-emerald-400/10 px-2 py-1 text-emerald-300">

                              {event.toUser?.name ||

                                "Unknown"}

                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>



        {/* Recent Products */}



        <section className="mt-10">

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">

                Products

              </p>



              <h2 className="mt-1 text-xl font-semibold">

                Recent Products

              </h2>

            </div>



            <div className="flex gap-3">

              <button

                onClick={refreshProducts}

                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:text-white"

              >

                <RefreshCw

                  size={14}

                  className={

                    productsLoading

                      ? "animate-spin"

                      : ""

                  }

                />



                Refresh

              </button>



              <Link

                to="/products"

                className="hidden items-center gap-2 text-sm text-zinc-400 transition hover:text-white sm:flex"

              >

                View all



                <ArrowRight size={15} />

              </Link>

            </div>

          </div>



          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

            {productsLoading ? (

              <div className="space-y-3 p-5">

                {Array.from({ length: 5 }).map(

                  (_, index) => (

                    <div

                      key={index}

                      className="h-16 animate-pulse rounded-xl bg-white/5"

                    />

                  )

                )}

              </div>

            ) : recentProducts.length === 0 ? (

              <div className="px-6 py-16 text-center">

                <Package

                  size={30}

                  className="mx-auto text-zinc-600"

                />



                <p className="mt-4 text-sm text-zinc-400">

                  No products found.

                </p>

              </div>

            ) : (

              <div className="divide-y divide-white/10">

                {recentProducts.map((product) => (

                  <Link

                    key={product._id}

                    to={`/product/${product.productId}`}

                    className="group flex flex-col gap-4 p-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between"

                  >

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">

                        <Package

                          size={18}

                          className="text-zinc-400"

                        />

                      </div>



                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <p className="font-mono text-sm font-medium text-white">

                            {product.productId}

                          </p>



                          <StatusBadge

                            status={product.status}

                          />



                          {product.blockchainTxHash && (

                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">

                              ON-CHAIN

                            </span>

                          )}

                        </div>



                        <p className="mt-1 truncate text-sm text-zinc-400">

                          {product.name}

                        </p>

                      </div>

                    </div>



                    <div className="flex items-center gap-5 text-xs text-zinc-500">

                      <span className="hidden md:block">

                        {product.location ||

                          "Location unavailable"}

                      </span>



                      <ExternalLink

                        size={16}

                        className="transition group-hover:text-emerald-300"

                      />

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </div>

        </section>



        {/* Quick Actions */}



        <section className="mt-8 grid gap-4 md:grid-cols-3">

          <Link

            to="/verify"

            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"

          >

            <ShieldCheck

              size={21}

              className="text-emerald-300"

            />



            <h3 className="mt-5 font-medium">

              Verify a Product

            </h3>



            <p className="mt-2 text-sm text-zinc-500">

              Check QR, hash and blockchain authenticity.

            </p>



            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400 group-hover:text-emerald-300">

              Open verification



              <ArrowRight size={14} />

            </div>

          </Link>



          <Link

            to="/products"

            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"

          >

            <Package

              size={21}

              className="text-emerald-300"

            />



            <h3 className="mt-5 font-medium">

              Browse Products

            </h3>



            <p className="mt-2 text-sm text-zinc-500">

              Explore registered products and their records.

            </p>



            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400 group-hover:text-emerald-300">

              View products



              <ArrowRight size={14} />

            </div>

          </Link>



          <Link

            to="/"

            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"

          >

            <Box

              size={21}

              className="text-emerald-300"

            />



            <h3 className="mt-5 font-medium">

              ChainTrace Home

            </h3>



            <p className="mt-2 text-sm text-zinc-500">

              Return to the public ChainTrace platform.

            </p>



            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400 group-hover:text-emerald-300">

              Go home



              <ArrowRight size={14} />

            </div>

          </Link>

        </section>



        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-zinc-600">

          ChainTrace • Blockchain Supply Chain & Product

          Verification

        </footer>

      </main>

    </div>

  );

}