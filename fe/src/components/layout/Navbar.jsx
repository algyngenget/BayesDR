"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Activity, Sparkles } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path) => pathname === path;

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-(--color-border) bg-(--color-surface)/80 shadow-lg backdrop-blur-xl transition-all duration-300">
        <div className="flex h-16 items-center justify-between px-5">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 no-underline"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-(--color-primary) to-(--color-primary-dark) shadow-md transition-transform duration-300 group-hover:scale-105">
              <Activity className="h-5 w-5 animate-pulse text-white" />
              <div className="absolute -inset-0.5 rounded-xl bg-(--color-primary-light) opacity-20 blur-sm transition-opacity group-hover:opacity-40"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-(--color-text-primary)">
                  Bayes
                  <span className="bg-linear-to-r from-(--color-primary) to-(--color-primary-light) bg-clip-text text-transparent">
                    DR
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-(--color-primary)/20 bg-(--color-primary-bg) px-2 py-0.5 text-[10px] font-bold text-(--color-primary-dark)">
                  <Sparkles className="h-2.5 w-2.5" /> BCNN
                </span>
              </div>
              <p className="m-0 text-[10px] font-medium tracking-wider text-(--color-text-muted) uppercase">
                Diabetic Retinopathy
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1.5 md:flex">
            <Link
              href="/"
              className={`relative rounded-xl px-4 py-2 text-sm font-bold no-underline transition-all duration-200 ${
                isActive("/")
                  ? "bg-(--color-primary) text-white shadow-(--color-primary-glow)"
                  : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text-primary)"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/classify"
              className={`relative rounded-xl px-4 py-2 text-sm font-bold no-underline transition-all duration-200 ${
                isActive("/classify")
                  ? "bg-(--color-primary) text-white shadow-(--color-primary-glow)"
                  : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text-primary)"
              }`}
            >
              Klasifikasi
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) transition-colors hover:bg-(--color-surface-hover)"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="animate-fade-in border-t border-(--color-border) p-4 md:hidden">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-bold no-underline transition-all ${
                  isActive("/")
                    ? "bg-(--color-primary-bg) text-(--color-primary-dark)"
                    : "text-(--color-text-secondary) hover:bg-(--color-surface-hover)"
                }`}
              >
                Beranda
              </Link>
              <Link
                href="/classify"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-bold no-underline transition-all ${
                  isActive("/classify")
                    ? "bg-(--color-primary-bg) text-(--color-primary-dark)"
                    : "text-(--color-text-secondary) hover:bg-(--color-surface-hover)"
                }`}
              >
                Klasifikasi
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
