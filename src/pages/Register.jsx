
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const { name, email, organization, password, confirmPassword } =
      formData;

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in your name, email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        organization: organization.trim(),
        password,
      });

      const data = response.data;

      if (!data.success || !data.token || !data.user) {
        setError(data.message || "Registration could not be completed.");
        return;
      }

      // Match the token and user keys used by the login page.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Account created successfully. Redirecting...");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 700);
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setError("This email is already registered. Please sign in.");
      } else {
        setError(
          err.response?.data?.message ||
            "Registration failed. Check the backend and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#36e6ad]/50";

  const labelClass =
    "text-[9px] uppercase tracking-[0.18em] text-white/50";

  return (
    <div className="min-h-screen bg-[#05090b] text-white">
      <div className="pointer-events-none fixed left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36e6ad]/5 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Link
            to="/"
            className="mx-auto mb-8 flex w-fit items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#36e6ad] text-black">
              <ShieldCheck size={17} />
            </div>
            <span className="text-sm font-semibold tracking-wide">
              chaintrace
            </span>
          </Link>

          <div className="border border-white/10 bg-[#081014] p-7 md:p-9">
            <div className="mb-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center border border-[#36e6ad]/20 bg-[#36e6ad]/5 text-[#36e6ad]">
                <User size={20} strokeWidth={1.5} />
              </div>

              <h1 className="text-3xl font-medium tracking-tight">
                Create your account.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/50">
                Join ChainTrace and build a transparent, verifiable
                product journey.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 border border-red-400/30 bg-red-400/5 p-3 text-sm text-red-300"
              >
                {error}
                {error.includes("already registered") && (
                  <Link
                    to="/login"
                    className="ml-2 underline"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 border border-[#36e6ad]/30 bg-[#36e6ad]/5 p-3 text-sm text-[#36e6ad]"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <div className="relative mt-2">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>
                <div className="relative mt-2">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className={labelClass}>
                  Organization (optional)
                </label>
                <div className="relative mt-2">
                  <Building2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    placeholder="Company or organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="border border-white/10 bg-black/10 p-3 text-xs leading-5 text-white/50">
                New public accounts are assigned the Customer role.
                Operational roles must be assigned through authorized
                administration.
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative mt-2">
                    <LockKeyhole
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className={labelClass}
                  >
                    Confirm password
                  </label>
                  <div className="relative mt-2">
                    <LockKeyhole
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength={6}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(event.target.checked)
                  }
                  className="mt-1 accent-[#36e6ad]"
                  required
                />
                <span className="text-xs leading-5 text-white/50">
                  I agree to the ChainTrace{" "}
                  <a
                    href="/terms"
                    className="text-[#36e6ad] hover:underline"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-[#36e6ad] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 bg-[#36e6ad] px-5 py-3.5 text-xs font-semibold text-black transition hover:bg-[#58f0c0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
                {!loading && (
                  <ArrowUpRight
                    size={15}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <span className="text-xs text-white/50">
                Already have an account?
              </span>
              <Link
                to="/login"
                className="ml-2 text-xs text-[#36e6ad] transition hover:text-[#58f0c0]"
              >
                Sign in
              </Link>
            </div>
          </div>

          <Link
            to="/"
            className="mx-auto mt-7 flex w-fit items-center gap-2 text-xs text-white/50 transition hover:text-[#36e6ad]"
          >
            <ArrowLeft size={13} />
            Back to ChainTrace
          </Link>

          <p className="mt-6 text-center text-[9px] uppercase tracking-[0.16em] text-white/30">
            Secure registration · ChainTrace
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
