import { ArrowUpRight, Box, ShieldCheck } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#05090b]">

      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-14 md:grid-cols-4">

          {/* BRAND */}
          <div className="md:col-span-2">

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#36e6ad] text-black">
                <Box size={16} />
              </div>

              <span className="text-sm font-semibold tracking-wide">
                chaintrace
              </span>
            </div>

            <p className="mt-6 max-w-md text-sm leading-6 text-white/35">
              A transparent trust layer for the physical world.
              Track products, verify authenticity, and follow every
              supply-chain journey.
            </p>

            <a
              href="/verify"
              className="group mt-7 inline-flex items-center gap-2 bg-[#36e6ad] px-5 py-3 text-xs font-semibold text-black transition hover:bg-[#58f0c0]"
            >
              Verify a product

              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>

          </div>

          {/* PLATFORM */}
          <div>
            <div className="mb-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Platform
            </div>

            <div className="flex flex-col gap-4">

              <FooterLink
                href="/"
                text="Overview"
              />

              <FooterLink
                href="/products"
                text="Product registry"
              />

              <FooterLink
                href="/verify"
                text="Verify product"
              />

              <FooterLink
                href="/"
                text="How it works"
              />

            </div>
          </div>

          {/* ACCOUNT */}
          <div>
            <div className="mb-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Account
            </div>

            <div className="flex flex-col gap-4">

              <FooterLink
                href="/login"
                text="Sign in"
              />

              <FooterLink
                href="/register"
                text="Create account"
              />

              <FooterLink
                href="/forgot-password"
                text="Forgot password"
              />

            </div>

            {/* SOCIAL / VERIFICATION */}
            <div className="mt-8 flex gap-2">

              <a
                href="#"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/40 transition hover:border-[#36e6ad]/40 hover:text-[#36e6ad]"
              >
                <span className="text-xs font-semibold">
                  GH
                </span>
              </a>

              <a
                href="/verify"
                aria-label="Verification"
                className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/40 transition hover:border-[#36e6ad]/40 hover:text-[#36e6ad]"
              >
                <ShieldCheck size={15} />
              </a>

            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-6 text-[9px] uppercase tracking-[0.16em] text-white/20 md:flex-row md:items-center md:justify-between">

          <span>
            © 2026 ChainTrace. All rights reserved.
          </span>

          <div className="flex gap-6">

            <a
              href="#"
              className="transition hover:text-white/50"
            >
              Privacy
            </a>

            <a
              href="#"
              className="transition hover:text-white/50"
            >
              Terms
            </a>

            <span>
              Built for trust
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}


/* FOOTER LINK */

function FooterLink({ href, text }) {
  return (
    <a
      href={href}
      className="w-fit text-xs text-white/40 transition hover:translate-x-1 hover:text-[#36e6ad]"
    >
      {text}
    </a>
  );
}

export default Footer;