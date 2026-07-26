import Link from "next/link";
import { Activity, ShieldAlert, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-(--color-footer-border) bg-(--color-footer-bg) pt-16 pb-10 text-(--color-footer-text)">
      <div className="mx-auto max-w-6xl px-6">
        {/* Main Footer Content */}
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-(--color-primary) to-(--color-primary-dark) shadow-md">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-(--color-footer-text)">
                Bayes<span className="text-(--color-footer-accent)">DR</span>
              </span>
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-(--color-footer-text-muted)">
              Sistem AI Klasifikasi Diabetic Retinopathy berbasis Bayesian
              Convolutional Neural Network dengan kalkulasi tingkat
              ketidakpastian (uncertainty estimation).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-7">
            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-xs font-extrabold tracking-wider text-(--color-footer-text-heading) uppercase">
                Navigasi Utama
              </h4>
              <div className="flex flex-col space-y-2.5">
                <Link
                  href="/"
                  className="text-sm font-medium text-(--color-footer-text-muted) no-underline transition-colors hover:text-(--color-footer-accent)"
                >
                  Beranda
                </Link>
                <Link
                  href="/classify"
                  className="text-sm font-medium text-(--color-footer-text-muted) no-underline transition-colors hover:text-(--color-footer-accent)"
                >
                  Mulai Klasifikasi
                </Link>
                <a
                  href="#about"
                  className="text-sm font-medium text-(--color-footer-text-muted) no-underline transition-colors hover:text-(--color-footer-accent)"
                >
                  Informasi Diabetic Retinopathy
                </a>
              </div>
            </div>

            {/* Technology */}
            <div>
              <h4 className="mb-4 flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-(--color-footer-text-heading) uppercase">
                <Cpu className="h-4 w-4 text-(--color-footer-accent)" />{" "}
                Teknologi Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-(--color-footer-border) bg-(--color-footer-tag-bg) px-3 py-1 text-xs font-semibold text-(--color-footer-tag-text)">
                  Bayesian CNN
                </span>
                <span className="rounded-lg border border-(--color-footer-border) bg-(--color-footer-tag-bg) px-3 py-1 text-xs font-semibold text-(--color-footer-tag-text)">
                  MC Dropout
                </span>
                <span className="rounded-lg border border-(--color-footer-border) bg-(--color-footer-tag-bg) px-3 py-1 text-xs font-semibold text-(--color-footer-tag-text)">
                  Next.js 16
                </span>
                <span className="rounded-lg border border-(--color-footer-border) bg-(--color-footer-tag-bg) px-3 py-1 text-xs font-semibold text-(--color-footer-tag-text)">
                  Python
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px bg-(--color-footer-border)"></div>

        {/* Bottom Row */}
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <p className="text-xs text-(--color-footer-text-muted)">
            © {new Date().getFullYear()} BayesDR. Dikembangkan untuk riset &
            klasifikasi gambar medis.
          </p>

          <div className="flex max-w-xl items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs leading-relaxed text-amber-300">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
            <span>
              <strong>Disclaimer Medis:</strong> Hasil analisis Bayesian CNN ini
              merupakan alat bantu dan bukan diagnosis pengganti dari dokter
              spesialis mata.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
