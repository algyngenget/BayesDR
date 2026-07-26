"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { DR_CLASSES, SAMPLE_IMAGES } from "@/libs/constant";
import {
  AlertTriangle,
  Check,
  CloudUpload,
  Send,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Activity,
  BarChart3,
  BrainCircuit,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import useClassifyStore from "@/services/store";

const CLASS_BAR_COLORS = [
  "#10b981", // No DR
  "#f59e0b", // Mild
  "#f97316", // Moderate
  "#ef4444", // Severe
  "#e11d48", // Proliferate DR
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-xl backdrop-blur-md">
        <p className={`text-xs font-bold ${data.textColor}`}>{data.name}</p>
        <p className="text-base font-extrabold text-(--color-text-primary)">
          {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

export default function ClassifyPage() {
  const {
    selectedImage,
    imagePreview,
    isLoading,
    result,
    error,
    setImage,
    setError,
    classifyImage,
    reset,
  } = useClassifyStore();

  const fileInputRef = useRef(null);
  const resultSectionRef = useRef(null);
  const imageSectionRef = useRef(null);

  const chartData = result?.probabilities?.map((prob, idx) => ({
    name: DR_CLASSES[idx]?.label || `Class ${idx}`,
    percentage: Number((prob * 100).toFixed(1)),
    color: CLASS_BAR_COLORS[idx] || "#0d9488",
    textColor: DR_CLASSES[idx]?.textColor || "text-(--color-text-primary)",
  }));

  // Auto-scroll ke hasil ketika result berubah
  useEffect(() => {
    if (result && resultSectionRef.current) {
      setTimeout(() => {
        resultSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [result]);

  // Auto-scroll ke input image ketika imagePreview berubah
  useEffect(() => {
    if (imagePreview && imageSectionRef.current) {
      setTimeout(() => {
        imageSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [imagePreview]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      setError("Format file tidak valid. Upload gambar (PNG, JPG, BMP).");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClassify = () => {
    classifyImage();
  };

  const handleReset = () => {
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (imageSectionRef.current) {
      setTimeout(() => {
        imageSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };

  // Helper to load real sample image file from /sample_images
  const loadSampleImageByFile = async (sample) => {
    try {
      const response = await fetch(`/sample_images/${sample.file}`);
      if (!response.ok) throw new Error("Gagal mengambil file sampel");
      const blob = await response.blob();
      const ext = sample.file.split(".").pop();
      const mimeType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";
      const file = new File([blob], sample.file, { type: mimeType });
      setImage(file);
    } catch (err) {
      console.error("Error loading sample image:", err);
      setError("Gagal memuat sampel gambar dari folder /sample_images.");
    }
  };

  const currentClass = result ? DR_CLASSES[result.predicted_class] : null;

  return (
    <div className="min-h-screen flex-1 bg-(--color-background) pt-28 pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--color-primary)/20 bg-(--color-primary-bg) px-4 py-1.5 text-xs font-extrabold text-(--color-primary-dark)">
            <Sparkles className="h-4 w-4 text-(--color-primary)" /> Bayesian CNN
            Diagnostic
          </div>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-(--color-text-primary) sm:text-4xl">
            Klasifikasi Diabetic Retinopathy
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-(--color-text-secondary) sm:text-lg">
            Unggah citra fundus mata untuk kalkulasi diagnosis tingkat keparahan
            dengan algoritma <strong>Bayesian Monte Carlo Dropout</strong> &
            analisis uncertainty.
          </p>
        </div>

        {/* Upload Panel (Bento Container) */}
        <div
          ref={imageSectionRef}
          className="bento-card mb-10 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-(--color-primary) to-(--color-primary-dark) shadow-md">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-(--color-text-primary)">
                  Upload Gambar Fundus
                </h2>
                <p className="text-xs font-medium text-(--color-text-muted)">
                  Pilih file lokal atau gunakan sampel gambar yang tersedia
                </p>
              </div>
            </div>
          </div>

          {/* Quick Real Sample Images Gallery Bar */}
          <div className="mb-6 rounded-2xl border border-(--color-border) bg-(--color-background) p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-(--color-text-primary)">
                <Sparkles className="h-3.5 w-3.5 text-(--color-primary)" />{" "}
                Pilihan Gambar Sampel:
              </span>
              <span className="text-[11px] font-semibold text-(--color-text-muted)">
                Klik gambar untuk menguji
              </span>
            </div>

            <div className="scrollbar-thin flex gap-3 overflow-x-auto py-2">
              {SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSampleImageByFile(sample)}
                  className="group relative flex shrink-0 cursor-pointer flex-col items-center overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) p-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-(--color-primary) hover:shadow-md"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-(--color-border)">
                    <Image
                      src={`/sample_images/${sample.file}`}
                      alt={sample.label}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <span className="mt-1.5 text-[11px] font-bold text-(--color-text-primary)">
                    {sample.label}
                  </span>
                  <span className="text-[9px] font-semibold text-(--color-text-muted)">
                    {sample.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              imagePreview
                ? "border-(--color-primary) bg-(--color-primary-bg)/30"
                : "border-(--color-border) bg-(--color-background) hover:border-(--color-primary-light) hover:bg-(--color-primary-bg)/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreview ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative mx-auto inline-block overflow-hidden rounded-2xl border border-(--color-border) shadow-2xl">
                  <Image
                    src={imagePreview}
                    alt="Preview Fundus"
                    width={280}
                    height={280}
                    className="mx-auto h-auto max-h-72 w-auto max-w-full object-contain"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-(--color-primary)/30 bg-(--color-surface) px-4 py-1.5 text-xs font-bold text-(--color-primary-dark) shadow-sm">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{selectedImage?.name}</span>
                  <span className="text-(--color-text-muted)">
                    ({(selectedImage?.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-primary-bg) text-(--color-primary) shadow-inner transition-transform group-hover:scale-110">
                  <CloudUpload className="h-8 w-8" />
                </div>
                <p className="mb-1 text-base font-extrabold text-(--color-text-primary)">
                  Klik atau Drag & Drop Gambar Fundus Di Sini
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  Mendukung format PNG, JPG, JPEG, BMP (Maksimum 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Action Control Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleClassify}
              disabled={!selectedImage || isLoading}
              className={`flex flex-1 items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-base font-extrabold transition-all duration-200 ${
                !selectedImage || isLoading
                  ? "cursor-not-allowed bg-(--color-disabled-bg) text-(--color-disabled-text)"
                  : "bg-linear-to-r from-(--color-primary) to-(--color-primary-dark) text-white shadow-lg hover:scale-[1.01] hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Menganalisis 25 Iterasi Monte Carlo...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Mulai Klasifikasi Diagnosis</span>
                </>
              )}
            </button>

            {selectedImage && (
              <button
                onClick={handleReset}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) px-6 py-4 text-base font-bold text-(--color-text-secondary) transition-all hover:bg-(--color-surface-hover) hover:text-(--color-text-primary) ${
                  isLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <RotateCcw className="h-5 w-5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="animate-fade-in mt-5 flex items-center gap-3 rounded-2xl border border-(--color-error-border) bg-(--color-error-bg) p-4 text-sm font-semibold text-(--color-error-text)">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Dashboard Section */}
        {(isLoading || result) && (
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
                  Menjalankan 25 Sampling Monte Carlo Dropout untuk kalkulasi
                  variansi probabilitas
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

                  {chartData && (
                    <div className="space-y-4">
                      <div className="h-64 w-full pt-2 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            margin={{
                              top: 20,
                              right: 10,
                              left: -20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="var(--color-border)"
                              opacity={1}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{
                                fill: "var(--color-text-secondary)",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                              axisLine={{ stroke: "var(--color-border)" }}
                              tickLine={false}
                            />
                            <YAxis
                              unit="%"
                              domain={[0, 100]}
                              tick={{
                                fill: "var(--color-text-muted)",
                                fontSize: 11,
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              content={<CustomTooltip />}
                              cursor={{
                                fill: "var(--color-surface-hover)",
                                opacity: 0.4,
                              }}
                            />
                            <Bar
                              dataKey="percentage"
                              radius={[8, 8, 0, 0]}
                              barSize={100}
                              animationDuration={50}
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
