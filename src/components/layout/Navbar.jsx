import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Box,
  Menu,
  X,
} from "lucide-react";

import NotificationBell from "../NotificationBell";

function Navbar() {
  const [open, setOpen] = useState(false);

  const isLoggedIn = Boolean(
    localStorage.getItem("token")
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#05090b]/80 backdrop-blur-xl">

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* LOGO */}
        <a
          href="/"
          className="group flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <motion.div
            whileHover={{
              rotate: 12,
              scale: 1.05,
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#36e6ad] text-black"
          >
            <Box size={15} />
          </motion.div>

          <span className="text-sm font-semibold tracking-wide">
            chaintrace
          </span>
        </a>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-8 md:flex">

          <NavLink
            href="/"
            text="Overview"
          />

          <NavLink
            href="/verify"
            text="Verify product"
          />

          <NavLink
            href="/products"
            text="Product registry"
          />

          <NavLink
            href="/"
            text="Workflow"
          />

        </div>

        {/* DESKTOP RIGHT SIDE */}
        <div className="hidden items-center gap-3 md:flex">

          {/* NOTIFICATION */}
          {isLoggedIn && (
            <NotificationBell />
          )}

          {/* SIGN IN */}
          {!isLoggedIn && (
            <a
              href="/login"
              className="group flex items-center gap-2 border border-white/15 px-4 py-2 text-xs text-white/80 transition-all duration-300 hover:border-[#36e6ad]/60 hover:text-[#36e6ad]"
            >
              Sign in

              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          )}

          {/* DASHBOARD */}
          {isLoggedIn && (
            <a
              href="/dashboard"
              className="group flex items-center gap-2 border border-white/15 px-4 py-2 text-xs text-white/80 transition-all duration-300 hover:border-[#36e6ad]/60 hover:text-[#36e6ad]"
            >
              Dashboard

              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          )}

        </div>

        {/* MOBILE RIGHT SIDE */}
        <div className="flex items-center gap-2 md:hidden">

          {/* MOBILE NOTIFICATION */}
          {isLoggedIn && (
            <NotificationBell />
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/80"
            aria-label={
              open
                ? "Close menu"
                : "Open menu"
            }
          >
            {open ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>

        </div>

      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="overflow-hidden border-t border-white/10 bg-[#05090b]"
          >

            <div className="flex flex-col px-6 py-6">

              <MobileLink
                href="/"
                text="Overview"
                closeMenu={() => setOpen(false)}
              />

              <MobileLink
                href="/verify"
                text="Verify product"
                closeMenu={() => setOpen(false)}
              />

              <MobileLink
                href="/products"
                text="Product registry"
                closeMenu={() => setOpen(false)}
              />

              <MobileLink
                href="/"
                text="Workflow"
                closeMenu={() => setOpen(false)}
              />

              {isLoggedIn ? (
                <a
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 bg-[#36e6ad] px-4 py-3 text-xs font-semibold text-black"
                >
                  Dashboard
                  <ArrowUpRight size={14} />
                </a>
              ) : (
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 bg-[#36e6ad] px-4 py-3 text-xs font-semibold text-black"
                >
                  Sign in
                  <ArrowUpRight size={14} />
                </a>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}

function NavLink({ href, text }) {
  return (
    <a
      href={href}
      className="group relative text-xs text-white/50 transition-colors duration-300 hover:text-white"
    >
      {text}

      <span className="absolute -bottom-2 left-0 h-px w-0 bg-[#36e6ad] transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

function MobileLink({
  href,
  text,
  closeMenu,
}) {
  return (
    <motion.a
      href={href}
      onClick={closeMenu}
      initial={{
        opacity: 0,
        x: -10,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="border-b border-white/10 py-4 text-sm text-white/60 transition hover:text-[#36e6ad]"
    >
      {text}
    </motion.a>
  );
}

export default Navbar;