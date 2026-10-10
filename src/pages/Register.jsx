import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

function Register() {
  return (
    <div className="min-h-screen bg-[#05090b] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-lg"
        >

          {/* Logo */}
          <a
            href="/"
            className="mx-auto mb-8 flex w-fit items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#36e6ad] text-black">
              <ShieldCheck size={17} />
            </div>

            <span className="text-sm font-semibold tracking-wide">
              chaintrace
            </span>
          </a>

          {/* Card */}
          <div className="border border-white/10 bg-[#081014] p-7 md:p-9">

            {/* Header */}
            <div className="mb-8">

              <div className="mb-5 flex h-11 w-11 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                <User size={20} strokeWidth={1.5} />
              </div>

              <h1 className="text-3xl font-medium tracking-tight">
                Create your account.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/35">
                Join ChainTrace and build a transparent, verifiable
                product journey.
              </p>

            </div>

            {/* FORM */}
            <form className="space-y-5">

              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="text-[9px] uppercase tracking-[0.18em] text-white/30"
                >
                  Full name
                </label>

                <div className="relative mt-2">

                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />

                  <input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    className="w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                  />

                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="text-[9px] uppercase tracking-[0.18em] text-white/30"
                >
                  Email address
                </label>

                <div className="relative mt-2">

                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                  />

                </div>
              </div>

              {/* ORGANIZATION */}
              <div>
                <label
                  htmlFor="organization"
                  className="text-[9px] uppercase tracking-[0.18em] text-white/30"
                >
                  Organization
                </label>

                <div className="relative mt-2">

                  <Building2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />

                  <input
                    id="organization"
                    type="text"
                    placeholder="Company or organization"
                    className="w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                  />

                </div>
              </div>

              {/* ROLE */}
              <div>
                <label
                  htmlFor="role"
                  className="text-[9px] uppercase tracking-[0.18em] text-white/30"
                >
                  Role
                </label>

                <select
                  id="role"
                  defaultValue=""
                  className="mt-2 w-full border border-white/10 bg-[#05090b] px-4 py-3.5 text-sm text-white/70 outline-none transition focus:border-[#36e6ad]/50"
                >
                  <option value="" disabled>
                    Select your role
                  </option>

                  <option value="manufacturer">
                    Manufacturer
                  </option>

                  <option value="supplier">
                    Supplier
                  </option>

                  <option value="distributor">
                    Distributor
                  </option>

                  <option value="retailer">
                    Retailer
                  </option>

                  <option value="customer">
                    Customer
                  </option>
                </select>
              </div>

              {/* PASSWORDS */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="password"
                    className="text-[9px] uppercase tracking-[0.18em] text-white/30"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">

                    <LockKeyhole
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                    />

                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                    />

                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-[9px] uppercase tracking-[0.18em] text-white/30"
                  >
                    Confirm password
                  </label>

                  <div className="relative mt-2">

                    <LockKeyhole
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                    />

                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                    />

                  </div>
                </div>

              </div>

              {/* TERMS */}
              <label className="flex cursor-pointer items-start gap-3">

                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-white/15">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                  />

                  <Check
                    size={11}
                    className="text-[#36e6ad] opacity-0 transition peer-checked:opacity-100"
                  />
                </span>

                <span className="text-xs leading-5 text-white/30">
                  I agree to the ChainTrace{" "}
                  <a
                    href="#"
                    className="text-[#36e6ad]/80 hover:text-[#36e6ad]"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#36e6ad]/80 hover:text-[#36e6ad]"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>

              </label>

              {/* SUBMIT */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 bg-[#36e6ad] px-5 py-3.5 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
              >
                Create account

                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>

            </form>

            {/* LOGIN */}
            <div className="mt-8 border-t border-white/10 pt-6 text-center">

              <span className="text-xs text-white/30">
                Already have an account?
              </span>

              <a
                href="/login"
                className="ml-2 text-xs text-[#36e6ad] transition hover:text-[#58f0c0]"
              >
                Sign in
              </a>

            </div>

          </div>

          {/* BACK */}
          <a
            href="/"
            className="mx-auto mt-7 flex w-fit items-center gap-2 text-xs text-white/30 transition hover:text-[#36e6ad]"
          >
            <ArrowLeft size={13} />
            Back to ChainTrace
          </a>

          <p className="mt-6 text-center text-[9px] uppercase tracking-[0.16em] text-white/20">
            Secure registration · ChainTrace
          </p>

        </motion.div>

      </div>
    </div>
  );
}

export default Register;