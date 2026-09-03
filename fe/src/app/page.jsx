import Link from "next/link";
import { ClassificationCard, FeatureCard } from "@/components/ui/Card";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Cpu,
  Eye,
  Sparkles,
  Layers,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-(--color-border) bg-linear-to-b from-(--color-hero-from) via-(--color-hero-via) to-(--color-hero-to) pt-36 pb-24">
        {/* Background Mesh Light Effect */}
        <div className="pointer-events-none absolute -top-40 right-0 h-120 w-120 rounded-full bg-cyan-400/15 blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-0 -left-20 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl"></div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column Content */}
            <div className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                </span>
                <span>Bayesian Convolutional Neural Network</span>
              </div>

              <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Deteksi{" "}
                <span className="bg-linear-to-r from-(--color-hero-text-highlight-from) to-(--color-hero-text-highlight-to) bg-clip-text text-transparent">
                  Diabetic Retinopathy
                </span>{" "}
                dengan Bayesian CNN
              </h1>

              <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Upload citra fundus retina mata untuk mendapatkan estimasi
                diagnosis tingkat keparahan beserta Confidence Score dan
                Uncertainty Estimation berbasis Monte Carlo Dropout.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/classify"
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-linear-to-r from-teal-400 to-cyan-500 px-8 py-4 text-base font-extrabold text-slate-950 no-underline shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/30"
                >
                  <span>Mulai Klasifikasi Sekarang</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                {/* <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-base font-bold text-white no-underline backdrop-blur-md transition-all hover:bg-white/10"
                >
                  Pelajari Sistem
                </a> */}
              </div>

              {/* Quick Feature Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                {/* <div>
                  <p className="text-2xl font-extrabold text-white">25x</p>
                  <p className="text-xs text-slate-300">
                    MC Dropout Iterations
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-emerald-300">
                    5 Stage
                  </p>
                  <p className="text-xs text-slate-300">Skala Severity DR</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-cyan-300">
                    $\sigma$ Index
                  </p>
                  <p className="text-xs text-slate-300">
                    Kuantifikasi Uncertainty
                  </p>
                </div> */}
              </div>
            </div>

            {/* Right Visual Graphic */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <div className="relative">
                {/* Glowing Outer Rings */}
                <div className="animate-float relative flex h-80 w-80 items-center justify-center rounded-full border border-white/20 bg-white/5 shadow-2xl backdrop-blur-xl sm:h-96 sm:w-96">
                  <div className="glow-cyan flex h-64 w-64 items-center justify-center rounded-full bg-linear-to-br from-amber-400/80 via-amber-600 to-amber-950 p-3 shadow-inner sm:h-72 sm:w-72">
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-950 shadow-2xl sm:h-36 sm:w-36">
                      <div className="animate-pulse-glow h-10 w-10 rounded-full bg-linear-to-br from-cyan-300 to-white/90 shadow-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Pills */}
                <div className="absolute top-4 -left-4 flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                  <Activity className="h-4 w-4 text-emerald-400" /> High
                  Reliability Guard
                </div>
                <div className="absolute right-4 -bottom-2 flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                  <Eye className="h-4 w-4 text-cyan-400" /> Fundus Image
                  Analysis
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Severity Levels Section */}
      <section id="about" className="bg-(--color-background) py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-(--color-primary)/20 bg-(--color-primary-bg) px-4 py-1.5 text-xs font-extrabold text-(--color-primary-dark)">
              <Sparkles className="h-3.5 w-3.5" /> Skala Diagnostik Medis
            </span>
            <h2 className="mb-5 text-3xl font-extrabold text-(--color-text-primary) sm:text-4xl">
              5 Tingkat Keparahan Diabetic Retinopathy
            </h2>
            <p className="text-base leading-relaxed text-(--color-text-secondary) sm:text-lg">
              Diabetic Retinopathy (DR) terjadi akibat kerusakan pembuluh darah
              retina oleh peningkatan kadar gula darah. Bayesian CNN
              mengklasifikasikan kondisi fundus ke dalam 5 tingkatan medis
            </p>
          </div>

          {/* Classification Levels Bento Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <ClassificationCard
              level="No DR"
              color="bg-(--color-status-success)"
              bgColor="bg-(--color-status-success)/10"
              borderColor="border-(--color-status-success)/30"
              description="Retina normal tanpa tanda kerusakan pembuluh darah."
              severity="0"
            />
            <ClassificationCard
              level="Mild"
              color="bg-(--color-status-warning)"
              bgColor="bg-(--color-status-warning)/10"
              borderColor="border-(--color-status-warning)/30"
              description="Kemunculan microaneurysms awal pada retina."
              severity="1"
            />
            <ClassificationCard
              level="Moderate"
              color="bg-(--color-status-danger)"
              bgColor="bg-(--color-status-danger)/10"
              borderColor="border-(--color-status-danger)/30"
              description="Penyumbatan pembuluh darah tahap menengah."
              severity="2"
            />
            <ClassificationCard
              level="Severe"
              color="bg-(--color-status-severe)"
              bgColor="bg-(--color-status-severe)/10"
              borderColor="border-(--color-status-severe)/30"
              description="Penyumbatan luas pada pembuluh darah retina."
              severity="3"
            />
            <ClassificationCard
              level="Proliferative"
              color="bg-(--color-status-critical)"
              bgColor="bg-(--color-status-critical)/10"
              borderColor="border-(--color-status-critical)/30"
              description="Pertumbuhan pembuluh darah abnormal yang berisiko kebutaan."
              severity="4"
            />
          </div>
        </div>
      </section>

      {/* Feature Section: Why Bayesian CNN */}
      <section className="border-y border-(--color-border) bg-(--color-surface) py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
              Inovasi Deep Learning Medis
            </span>
            <h2 className="text-3xl font-extrabold text-(--color-text-primary) sm:text-4xl">
              Mengapa Menggunakan Bayesian CNN?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={
                <Cpu className="h-7 w-7 text-teal-600 dark:text-teal-400" />
              }
              title="Monte Carlo Dropout"
              description="Menjalankan iterasi pengujian acak untuk menghasilkan probabilitas stabil serta meminimalkan bias prediksi."
              badge="Algoritma Bayesian"
            />
            <FeatureCard
              icon={
                <Layers className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
              }
              title="Uncertainty Quantification"
              description="Mengukur tingkat ketidakpastian  model secara matematis sehingga praktisi medis tahu kapabilitas keyakinan model."
              badge="Analisis Variansi"
            />
            <FeatureCard
              icon={
                <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              }
              title="Reliability Check"
              description="Otomatis memberi penanda apabila hasil diagnosis meragukan dan memerlukan peninjauan ulang oleh spesialis mata."
              badge="Clinical Safety"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
