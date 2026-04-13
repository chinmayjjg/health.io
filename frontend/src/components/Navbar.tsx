"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuthToken, clearAuthToken } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/ai", label: "AI Suggestion" },
  { href: "/services", label: "Services" },
];

const authLinks = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign Up" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-lg shadow-lg shadow-emerald-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">MediCare</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                isActive(link.href) ? "text-emerald-400" : "text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-emerald-400"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <>
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    link.href === "/signup"
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "text-gray-300 hover:text-emerald-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-300 hover:bg-white/10 md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="mx-auto max-w-7xl px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 rounded-lg bg-black/95 p-4 backdrop-blur-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 ${
                  isActive(link.href)
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-white/10" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/10"
              >
                Dashboard
              </Link>
            ) : (
              authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    link.href === "/signup"
                      ? "bg-emerald-500 text-center text-white"
                      : "text-center text-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
