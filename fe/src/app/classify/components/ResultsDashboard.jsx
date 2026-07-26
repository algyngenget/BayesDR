"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { DR_CLASSES } from "@/libs/constant";
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  BarChart3,
  BrainCircuit,
} from "lucide-react";

const ProbabilityChart = dynamic(() => import("./ProbabilityChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center sm:h-72">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--color-border) border-t-(--color-primary)"></div>
    </div>
  ),
});

export default function ResultsDashboard({
  resultSectionRef,
  isLoading,
  result,
  imagePreview,
  chartData,
}) {
  const currentClass = result ? DR_CLASSES[result.predicted_class] : null;

  if (!isLoading && !result) return null;

  return (
    <div
      ref={resultSectionRef}
      className="bento-card animate-fade-in scroll-mt-28 p-6 backdrop-blur-xl sm:p-8"
    >
      <div className="mb-8 flex items-center justify-between border-b border-(--color-border) pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-md">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-(--color-text-primary)">
              Hasil Analisis
            </h2>
            <p className="text-xs font-medium text-(--color-text-muted)">
              Probabilities & Uncertainty Estimation
            </p>
          </div>
        </div>

        {result && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
            <Activity className="h-3.5 w-3.5" /> Analisis Selesai
          </span>
        )}
      </div>

      {/* Loading Indicator Spinner */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-(--color-primary) opacity-20"></div>
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-(--color-border) border-t-(--color-primary)"></div>
          </div>
          <p className="text-lg font-extrabold text-(--color-text-primary)">
            Memproses Citra Retina...
          </p>
          <p className="mt-1 text-xs text-(--color-text-muted)">
            Menjalankan 25 Sampling Monte Carlo Dropout untuk kalkulasi variansi
            probabilitas
          </p>
        </div>
      )}

      {/* Result Render Dashboard */}
      {result && currentClass && (
        <div className="space-y-6">
          {/* Primary Prediction Row */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Image Preview Thumbnail */}
            {imagePreview && (
              <div className="flex items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-background) p-3 lg:col-span-4">
                <Image
                  src={imagePreview}
                  alt="Analyzed Fundus"
                  width={200}
                  height={200}
                  className="h-44 w-44 rounded-xl object-cover shadow-lg"
                />
              </div>
            )}

            {/* Main Outcome Card */}
            <div
              className={`flex flex-col justify-between rounded-2xl p-6 ${currentClass.bgColor} border-2 ${currentClass.borderColor} ${
                imagePreview ? "lg:col-span-8" : "lg:col-span-12"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-(--color-text-muted) uppercase">
                    Prediksi Utama
                  </span>
                  <h3
                    className={`mt-1 text-3xl font-extrabold sm:text-4xl ${currentClass.textColor}`}
                  >
                    {currentClass.label}
                  </h3>
                </div>

                {/* Confidence Score Badge */}
                <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-3 text-center shadow-md">
                  <p className="text-[11px] font-bold text-(--color-text-muted) uppercase">
                    Confidence
                  </p>
                  <p className="text-2xl font-extrabold text-(--color-text-primary)">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Description Text */}
              <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface)/80 p-4">
                <p className="text-xs leading-relaxed text-(--color-text-secondary) sm:text-sm">
                  {currentClass.description}
                </p>
              </div>
            </div>
          </div>

          {/* Reliability & Uncertainty Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Reliability Badge Card */}
            {result.reliable_prediction !== undefined && (
              <div
                className={`rounded-2xl border p-5 ${
                  result.reliable_prediction
                    ? "border-(--color-reliable-border) bg-(--color-reliable-bg)"
                    : "border-(--color-unreliable-border) bg-(--color-unreliable-bg)"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.reliable_prediction ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold tracking-wider text-(--color-text-muted) uppercase">
                      Status Prediksi
                    </p>
                    <p
                      className={`text-base font-extrabold ${
                        result.reliable_prediction
                          ? "text-(--color-reliable-text)"
                          : "text-(--color-unreliable-text)"
                      }`}
                    >
                      {result.reliable_prediction
                        ? "Prediksi Reliabel"
                        : "Prediksi Memerlukan Verifikasi Dokter"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Uncertainty Index Card */}
            <div className="rounded-2xl border border-(--color-info) bg-(--color-info-bg) p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wider text-(--color-info-dark) uppercase">
                    Uncertainty Index (σ)
                  </p>
                  <p className="mt-0.5 text-xs text-(--color-text-muted)">
                    Tingkat Risiko:{" "}
                    <strong className="text-(--color-text-primary)">
                      {result.uncertainty_level || "N/A"}
                    </strong>
                  </p>
                </div>
                <span className="text-2xl font-extrabold text-(--color-info-dark)">
                  {result.uncertainty?.toFixed(4) || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Probability Spectrum Distribution */}
          <div className="rounded-2xl border border-(--color-border) bg-(--color-background) p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-(--color-text-primary)">
                <BarChart3 className="h-4 w-4 text-(--color-primary)" />
                Distribusi Probabilitas per Kelas
              </h3>
              <span className="text-xs font-medium text-(--color-text-muted)">
                Total 5 Skala Medis
              </span>
            </div>

            <ProbabilityChart chartData={chartData} />
          </div>
        </div>
      )}
    </div>
  );
}
