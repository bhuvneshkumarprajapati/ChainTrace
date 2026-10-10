import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      console.log("Login request started...");
      console.log("Email:", email);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log("Login response:", response.data);

      // Save JWT token
      localStorage.setItem("token", response.data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      console.log("Token saved successfully");
      console.log("User saved:", response.data.user);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response:", error.response.data);

        setError(
          error.response.data?.message ||
            `Login failed with status ${error.response.status}`
        );
      } else if (error.request) {
        console.error("No response received from server");

        setError(
          "Cannot connect to ChainTrace server. Make sure backend is running on port 5000."
        );
      } else {
        console.error("Request error:", error.message);

        setError(
          error.message || "Login request failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

          {/* Login Card */}
          <div className="border border-white/10 bg-[#081014] p-7 md:p-9">

            {/* Header */}
            <div className="mb-8">

              <div className="mb-5 flex h-11 w-11 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                <LockKeyhole
                  size={20}
                  strokeWidth={1.5}
                />
              </div>

              <h1 className="text-3xl font-medium tracking-tight">
                Welcome back.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/35">
                Sign in to manage products, track supply-chain events,
                and verify blockchain records.
              </p>

            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs leading-5 text-red-300">
                {error}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

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
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                  />

                </div>
              </div>

              {/* PASSWORD */}
              <div>

                <div className="flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-[9px] uppercase tracking-[0.18em] text-white/30"
                  >
                    Password
                  </label>

                  <a
                    href="/forgot-password"
                    className="text-[10px] text-[#36e6ad]/70 transition hover:text-[#36e6ad]"
                  >
                    Forgot password?
                  </a>

                </div>

                <div className="relative mt-2">

                  <LockKeyhole
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#36e6ad]/50"
                  />

                </div>

              </div>

              {/* REMEMBER */}
              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-[#36e6ad]"
                />

                <span className="text-xs text-white/35">
                  Remember me
                </span>

              </label>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 bg-[#36e6ad] px-5 py-3.5 text-xs font-semibold text-black transition hover:bg-[#58f0c0] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "Signing in..."
                  : "Sign in"}

                {!loading && (
                  <ArrowUpRight
                    size={15}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                )}

              </button>

            </form>

            {/* REGISTER */}
            <div className="mt-8 border-t border-white/10 pt-6 text-center">

              <span className="text-xs text-white/30">
                Don't have an account?
              </span>

              <a
                href="/register"
                className="ml-2 text-xs text-[#36e6ad] transition hover:text-[#58f0c0]"
              >
                Create one
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

          {/* Security */}
          <p className="mt-6 text-center text-[9px] uppercase tracking-[0.16em] text-white/20">
            Secure authentication · ChainTrace
          </p>

        </motion.div>

      </div>
    </div>
  );
}

export default Login;