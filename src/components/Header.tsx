/**
 * Header.tsx - Navigation Header for Multi-Page Website
 *
 * Updated to match SinglePageHeader navigation style:
 * - Technology (link to /technology)
 * - Solutions (link to /landowners)
 * - EPA Collectives (link to /projects/current)
 * - About (link to /about)
 */

import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-new.png";
import { cn } from "@/lib/utils";

/**
 * Navigation Links - Matches SinglePageHeader structure
 */
const navLinks = [
  { label: "Technology", to: "/technology" },
  { label: "Solutions", to: "/landowners" },
  { label: "EPA Collectives", to: "/projects/current" },
  { label: "About", to: "/about" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          scrolled
            ? "py-3 bg-white/90 backdrop-blur-lg shadow-lg"
            : "py-6 bg-white/70 backdrop-blur-md shadow-sm"
        )}
      >
        <nav className="container flex items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="ErthaLoka Logo"
              className="h-9 md:h-11 w-auto transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "relative text-sm font-medium uppercase tracking-wide transition-colors duration-200",
                    isActive
                      ? "text-green-800"
                      : "text-gray-700 hover:text-green-700"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-800 rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative p-3 text-gray-700 hover:text-green-800 active:scale-95 transition-all rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-[72px] bg-black/30 backdrop-blur-sm z-[99]"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-[72px] left-0 w-64 bg-white/95 backdrop-blur-xl border-r border-b border-gray-200/50 shadow-lg z-[100] rounded-br-2xl"
            >
              <div className="space-y-2 px-6 py-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-lg font-medium text-gray-900 hover:text-green-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
