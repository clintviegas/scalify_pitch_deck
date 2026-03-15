"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BarChart3 } from "lucide-react";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "About", href: "https://scalify.ae/about", external: true },
  { label: "Analytics", href: "/dashboard" },
  { label: "Contact", href: "https://scalify.ae/contact", external: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-[#e5e0da]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#f05223] rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(240,82,35,0.3)]">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-[#0a0a0a] group-hover:text-[#f05223] transition-colors">
            Scalify
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isDashboard = link.href === "/dashboard";
            return link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#0a0a0a] transition-colors rounded-lg hover:bg-[#f5ede3]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#f05223] bg-[rgba(240,82,35,0.08)]"
                    : "text-[#6b7280] hover:text-[#0a0a0a] hover:bg-[#f5ede3]"
                }`}
              >
                {isDashboard && <BarChart3 className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://scalify.ae/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-2 px-5"
          >
            Start Your Project
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-[#6b7280] hover:text-[#0a0a0a] hover:bg-[#f5ede3] transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#e5e0da] px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 text-sm font-medium text-[#6b7280] hover:text-[#0a0a0a] rounded-lg hover:bg-[#f5ede3] transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 text-sm font-medium text-[#6b7280] hover:text-[#0a0a0a] rounded-lg hover:bg-[#f5ede3] transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
          <a
            href="https://scalify.ae/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-2 text-sm text-center"
          >
            Start Your Project
          </a>
        </div>
      )}
    </header>
  );
}
