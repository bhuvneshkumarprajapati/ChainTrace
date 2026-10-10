import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Mail, ShieldCheck } from "lucide-react";

function ForgotPassword() {
  return (
    <div className="min-h-screen bg-[#05090b] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-20">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md"
        >

          {/* Logo */}
          <a
            href="/"
            className="mx-auto mb-10 flex w-fit items-center gap-2"
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
                <Mail size={20} strokeWidth={1.5} />
              </div>

              <h1 className="text-3xl font-medium tracking-tight">
                Forgot your password?
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/35">
                Enter your registered email address and we'll send you
                instructions to reset your password.
              </p>

            </div>

            {/* Form */}
            <form className="space-y-5">

              <div>
                <label className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                />
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 bg-[#36e6ad] px-5 py-3.5 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
              >
                Send reset instructions

                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>

            </form>

            {/* Back */}
            <a
              href="/login"
              className="mx-auto mt-7 flex w-fit items-center gap-2 text-xs text-white/35 transition hover:text-[#36e6ad]"
            >
              <ArrowLeft size={13} />
              Back to sign in
            </a>

          </div>

          {/* Security note */}
          <p className="mt-6 text-center text-[9px] uppercase tracking-[0.16em] text-white/20">
            Secure account recovery · ChainTrace
          </p>

        </motion.div>

      </div>
    </div>
  );
}

export default ForgotPassword;