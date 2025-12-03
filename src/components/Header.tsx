import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, Database, ShieldCheck, TrendingUp, Globe, Cpu, Sparkles, Leaf } from "lucide-react";
import logo from "@/assets/logo-new.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Backdrop Blur Overlay - appears when dropdown is open with 20% blur */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setDropdownOpen(false)}
        />
      )}

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out glass-header",
          scrolled ? "py-3 shadow-lg" : "py-6 shadow-sm"
        )}
      >
      {/* Skip to main content - Accessibility */}
      {/* <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-800 focus:text-#0D2821 focus:rounded-lg focus:ring-2 focus:ring-#0D2821 focus:ring-offset-2"
      >
        Skip to main content
      </a> */}
      <nav className="container flex items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 group" aria-label="ErthaLoka Home">
          <img
            src={logo}
            alt="ErthaLoka Logo"
            className="h-9 md:h-11 w-auto transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(22,163,74,0.3)]"
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu
          className="hidden md:flex justify-center"
          onValueChange={(value) => setDropdownOpen(!!value)}
        >
          <NavigationMenuList className="gap-2" role="menubar">
            <NavigationMenuItem role="none">
              <NavigationMenuTrigger
                className="text-sm font-medium tracking-wide uppercase bg-transparent hover:bg-green-50/50 text-#0D2821 hover:text-green-900 focus:bg-green-50 focus:text-green-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 data-[active]:bg-green-50 data-[state=open]:bg-green-50 transition-all duration-200"
                aria-haspopup="true"
              >
                Solutions
              </NavigationMenuTrigger>
              <NavigationMenuContent role="menu" aria-label="Solutions submenu">
                <ul className="flex flex-col w-[140px] gap-1 p-3 bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-xl shadow-xl shadow-gray-200/50 border border-white/40">
                  <li>
                    <Link
                      to="/measure"
                      className="group flex items-center justify-center rounded-lg p-2 leading-none no-underline outline-none transition-all hover:bg-green-50/30 hover:backdrop-blur-sm focus:bg-green-50/30"
                      role="menuitem"
                    >
                      {/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-800 transition-all group-hover:bg-green-100 group-hover:scale-105">
                        <Database className="h-4 w-4" />
                      </div> */}
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-800">
                        Measure
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/verify"
                      className="group flex items-center justify-center rounded-lg p-2 leading-none no-underline outline-none transition-all hover:bg-green-50/30 hover:backdrop-blur-sm focus:bg-green-50/30"
                      role="menuitem"
                    >
                      {/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-800 transition-all group-hover:bg-green-100 group-hover:scale-105">
                        <ShieldCheck className="h-4 w-4" />
                      </div> */}
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-800">
                        Verify
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/abcde-framework"
                      className="group flex items-center justify-center rounded-lg p-2 leading-none no-underline outline-none transition-all hover:bg-green-50/30 hover:backdrop-blur-sm focus:bg-green-50/30"
                      role="menuitem"
                    >
                      {/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-800 transition-all group-hover:bg-green-100 group-hover:scale-105">
                        <TrendingUp className="h-4 w-4" />
                      </div> */}
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-800">
                        Value
                      </div>
                    </Link>
                  </li>
                  
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem role="none">
              <NavigationMenuTrigger
                className="text-sm font-medium tracking-wide uppercase bg-transparent hover:bg-green-50/50 text-#0D2821 hover:text-green-900 focus:bg-green-50 focus:text-green-900 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                aria-haspopup="true"
              >
                Technology
              </NavigationMenuTrigger>
              <NavigationMenuContent role="menu" aria-label="Technology submenu">
                <ul className="flex flex-col w-[140px] gap-1 p-3 bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-xl shadow-xl shadow-gray-200/50 border border-white/40">
                  <li>
                    <Link
                      to="/ABCDEFramework"
                      className="group flex items-center justify-center gap-3 rounded-lg p-2 leading-none no-underline outline-none transition-all hover:bg-green-50/30 hover:backdrop-blur-sm focus:bg-green-50/30"
                      role="menuitem"
                    >
                      {/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-800 transition-all group-hover:bg-green-100 group-hover:scale-105">
                        <Globe className="h-4 w-4" />
                      </div> */}
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-800">
                        PHI
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Data"
                      className="group flex items-center justify-center gap-3 rounded-lg p-2 leading-none no-underline outline-none transition-all hover:bg-green-50/30 hover:backdrop-blur-sm focus:bg-green-50/30"
                      role="menuitem"
                    >
                      {/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-800 transition-all group-hover:bg-green-100 group-hover:scale-105">
                        <Cpu className="h-4 w-4" />
                      </div> */}
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-800">
                          Di-NCA
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/bpop"
                      className="group flex items-center justify-center gap-3 rounded-lg p-2 leading-none no-underline outline-none transition-all hover:bg-green-50/30 hover:backdrop-blur-sm focus:bg-green-50/30"
                      role="menuitem"
                    >
                      {/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-800 transition-all group-hover:bg-green-100 group-hover:scale-105">
                        <Cpu className="h-4 w-4" />
                      </div> */}
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-800">
                        BLOCKCHAIN
                      </div>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem role="none">
              <NavLink
                to="/projects/current"
                className={({ isActive }) =>
                  cn(
                    "relative group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide text-#0D2821 uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isActive
                      ? "text-#0D2821 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-800 after:rounded-full"
                      : "text-#0D2821 hover:bg-green-50/50 hover:text-green-900"
                  )
                }
              >
                EPA Collectives
              </NavLink>
            </NavigationMenuItem>

            <NavigationMenuItem role="none">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  cn(
                    "relative group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isActive
                      ? "text-#0D2821 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-800 after:rounded-full"
                      : "text-#0D2821 hover:bg-green-50/50 hover:text-green-900"
                  )
                }
              >
                About
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem role="none">
              <NavLink
                to="/technology"
                className={({ isActive }) =>
                  cn(
                    "relative group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isActive
                      ? "text-#0D2821 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-800 after:rounded-full"
                      : "text-#0D2821 hover:bg-green-50/50 hover:text-green-900"
                  )
                }
              >
                Partner
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">


          <button
            className="md:hidden relative p-3 text-gray-700 hover:text-green-800 active:scale-95 transition-all focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
    </header>

      {/* Mobile Menu with AnimatePresence for smooth enter/exit */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop - 30% blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-[72px] bg-black/30 backdrop-blur-sm z-[99]"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu - Slides in from LEFT */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-[72px] left-0 w-64 bg-white/80 backdrop-blur-xl border-r border-b border-gray-200/50 shadow-lg z-[100] rounded-br-2xl"
            >
              <div className="space-y-6 px-6 py-8 text-center">
                {/* Solutions Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Solutions</h3>
                  <Link to="/measure" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Measure</Link>
                  <Link to="/verify" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Verify</Link>
                  <Link to="/abcde-framework" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Value</Link>
                </div>

                {/* Technology Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Technology</h3>
                  <Link to="/getthereport" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>PHI</Link>
                  <Link to="/Data" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>DNAC</Link>
                  <Link to="/bpop" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>B-POP</Link>
                </div>

                {/* Company Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company</h3>
                  <Link to="/projects/current" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>EPA</Link>
                  <Link to="/about" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                  <Link to="/technology" className="block text-lg font-medium text-gray-900 hover:text-green-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Partner</Link>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full rounded-full bg-green-800 hover:bg-green-900 text-white h-12 text-lg">
                    <a href="mailto:connect@erthaloka.com">Contact Us</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
