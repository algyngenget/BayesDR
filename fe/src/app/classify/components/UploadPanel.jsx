"use client";

import Image from "next/image";
import { SAMPLE_IMAGES } from "@/libs/constant";
import {
  AlertTriangle,
  Check,
  CloudUpload,
  Send,
  Upload,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function UploadPanel({
  imageSectionRef,
  fileInputRef,
  imagePreview,
  selectedImage,
  n_iterations,
  setIterations,
  isLoading,
  error,
  onImageSelect,
  onDrop,
  onDragOver,
  onClassify,
  onReset,
  onLoadSample,
}) {
  return (
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
            <Sparkles className="h-3.5 w-3.5 text-(--color-primary)" /> Pilihan
            Gambar Sampel:
          </span>
          <span className="text-[11px] font-semibold text-(--color-text-muted)">
            Klik gambar untuk menguji
          </span>
        </div>

        <div className="scrollbar-thin flex gap-3 overflow-x-auto py-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.file}
              type="button"
              onClick={() => onLoadSample(sample)}
              className="group relative flex shrink-0 cursor-pointer flex-col items-center overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) p-2 text-center transition-colors duration-200 hover:border-(--color-primary) hover:shadow-md"
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
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-300 ${
          imagePreview
            ? "border-(--color-primary) bg-(--color-primary-bg)/30"
            : "border-(--color-border) bg-(--color-background) hover:border-(--color-primary-light) hover:bg-(--color-primary-bg)/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageSelect}
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
                ({((selectedImage?.size ?? 0) / 1024).toFixed(0)} KB)
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
          type="button"
          onClick={onClassify}
          disabled={!selectedImage || isLoading}
          className={`flex w-full flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-base font-extrabold transition-colors duration-200 ${
            !selectedImage || isLoading
              ? "cursor-not-allowed bg-(--color-disabled-bg) text-(--color-disabled-text)"
              : "bg-linear-to-r from-(--color-primary) to-(--color-primary-dark) text-white shadow-lg hover:scale-[1.01] hover:shadow-xl"
          }`}
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              <span>Menganalisis {n_iterations} Iterasi Monte Carlo...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Mulai Klasifikasi Diagnosis</span>
            </>
          )}
        </button>
        <div
          className={`flex items-center gap-2 rounded-2xl border border-(--color-primary) bg-(--color-surface) px-4 py-3 shadow-lg sm:py-0 ${isLoading ? "cursor-default border-(--color-surface) opacity-50 hover:bg-(--color-surface) hover:text-(--color-text-secondary)" : ""}`}
        >
          <label
            htmlFor="n-iterations-input"
            className="text-xs font-bold whitespace-nowrap text-(--color-text-secondary)"
          >
            Iterasi MC:
          </label>
          <input
            id="n-iterations-input"
            type="number"
            min={1}
            max={100}
            value={n_iterations}
            disabled={isLoading}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
              setIterations(val);
            }}
            className="w-16 rounded-lg border border-(--color-border) bg-(--color-background) px-2 py-1 text-center text-sm font-extrabold text-(--color-text-primary) focus:border-(--color-primary) focus:outline-hidden"
          />
        </div>

        {selectedImage && (
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) px-6 py-4 text-base font-bold text-(--color-text-secondary) shadow-lg transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text-primary) ${
              isLoading
                ? "cursor-default opacity-50 hover:bg-(--color-surface) hover:text-(--color-text-secondary)"
                : ""
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
  );
}
