  "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/ai", label: "AI Suggestion" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">MediCare</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-emerald-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Sign Up
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-300 hover:bg-white/10 md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mx-auto max-w-7xl px-4 pb-3 md:hidden">
          <div className="flex flex-col gap-1 rounded-lg bg-black/95 p-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-2 mt-1">
              <Link href="/login" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-gray-300">Login</Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="block rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
