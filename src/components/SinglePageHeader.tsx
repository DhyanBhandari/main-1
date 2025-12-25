/**
 * SinglePageHeader.tsx - Navigation Header for Single Page Website
 *
 * This component provides anchor-based navigation for the single-page layout.
 * Unlike the main Header.tsx which uses react-router Links, this header
 * uses smooth-scrolling anchor links to navigate between sections.
 *
 * NAVIGATION LINKS:
 * - Technology → #technology
 * - Solutions → #solutions
 * - EPA Collectives → #epa-collectives
 * - About → #about
 *
 * FEATURES:
 * - Smooth scroll to sections with offset for fixed header
 * - Active section highlighting based on scroll position
 * - Mobile responsive with slide-in menu
 * - Glass morphism effect with backdrop blur
 * - Scroll-aware styling (compact on scroll)
 *
 * USAGE:
 * Import and use in SinglePage.tsx as the main navigation.
 * For multi-page navigation, use the original Header.tsx instead.
 *
 * @author ErthaLoka Dev Team
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-new.png";
import { cn } from "@/lib/utils";

/**
 * Navigation Links Configuration
 * Each link corresponds to a section ID in SinglePage.tsx
 * To add new sections:
 * 1. Add section with id in SinglePage.tsx
 * 2. Add corresponding link here
 */
const navLinks = [
  { label: "Technology", href: "#technology" },
  { label: "Solutions", href: "#solutions" },
  { label: "EPA Collectives", href: "#epa-collectives" },
  { label: "About", href: "#about" },
];

/**
 * SinglePageHeader Component
 * Renders the fixed navigation header with anchor links
 */
const SinglePageHeader = () => {
  // Mobile menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll state for header styling
  const [scrolled, setScrolled] = useState(false);

  // Currently visible section for active link highlighting
  const [activeSection, setActiveSection] = useState("");

  /**
   * Scroll Event Handler
   * - Updates header compact styling based on scroll position
   * - Determines which section is currently in view for active highlighting
   */
  useEffect(() => {
    const handleScroll = () => {
      // Apply compact styling when scrolled past 20px
      setScrolled(window.scrollY > 20);

      // Determine active section based on scroll position
      // We check sections in reverse order (bottom to top) and
      // mark the first one that's above the 150px threshold as active
      const sections = navLinks.map((link) => link.href.replace("#", ""));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Smooth Scroll Handler
   * Scrolls to the target section with offset for fixed header
   * @param e - Click event
   * @param href - Target section href (e.g., "#technology")
   */
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      // Header height offset to prevent content hiding behind fixed header
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    // Close mobile menu after navigation
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ============================================
          FIXED HEADER
          Glass morphism effect with scroll-aware styling
          ============================================ */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          scrolled
            ? "py-3 bg-white/90 backdrop-blur-lg shadow-lg"
            : "py-6 bg-white/70 backdrop-blur-md shadow-sm"
        )}
      >
        <nav className="container flex items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">

          {/* Logo - Scrolls to top on click */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group"
          >
            <img
              src={logo}
              alt="ErthaLoka Logo"
              className="h-9 md:h-11 w-auto transition-all duration-300 group-hover:scale-105"
            />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={cn(
                  "relative text-sm font-medium uppercase tracking-wide transition-colors duration-200",
                  activeSection === link.href.replace("#", "")
                    ? "text-green-800"
                    : "text-gray-700 hover:text-green-700"
                )}
              >
                {link.label}
                {/* Active Section Indicator - Animated underline */}
                {activeSection === link.href.replace("#", "") && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-800 rounded-full"
                  />
                )}
              </a>
            ))}
          </div>

          {/* Mobile Menu Toggle Button */}
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

      {/* ============================================
          MOBILE MENU
          Slide-in navigation panel for mobile devices
          ============================================ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay - Closes menu on click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-[72px] bg-black/30 backdrop-blur-sm z-[99]"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Menu Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-[72px] left-0 w-64 bg-white/95 backdrop-blur-xl border-r border-b border-gray-200/50 shadow-lg z-[100] rounded-br-2xl"
            >
              <div className="space-y-2 px-6 py-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={cn(
                      "block py-3 text-lg font-medium transition-colors",
                      activeSection === link.href.replace("#", "")
                        ? "text-green-800"
                        : "text-gray-900 hover:text-green-700"
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SinglePageHeader;
