"use client";

import { useState, useCallback, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
import {
  Layers,
  ArrowRight,
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * PreprocessingSteps — flexible grid that renders any number of
 * preprocessing step images returned by the backend.
 *
 * Props:
 *   steps: Array<{ key, label, description, image }> from result.preprocessing_steps
 */
export default function PreprocessingSteps({ steps }) {
  const [lightbox, setLightbox] = useState(null); // index of open image, or null
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const openLightbox = useCallback((idx) => setLightbox(idx), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const goPrev = useCallback(
    () =>
      setLightbox((prev) => (prev > 0 ? prev - 1 : (steps?.length ?? 1) - 1)),
    [steps]
  );
  const goNext = useCallback(
    () =>
      setLightbox((prev) => (prev < (steps?.length ?? 1) - 1 ? prev + 1 : 0)),
    [steps]
  );

  if (!steps || steps.length === 0) return null;

  return (
    <>
      {/* Section wrapper */}
      <div className="rounded-2xl border border-(--color-border) bg-(--color-background) p-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-(--color-text-primary)">
            <Layers className="h-4 w-4 text-(--color-primary)" />
            Tahapan Preprocessing
          </h3>
          <span className="text-xs font-medium text-(--color-text-muted)">
            {steps.length} Tahap Dijalankan
          </span>
        </div>

        {/* Step container — responsive flex */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:flex-row md:items-stretch md:gap-3 md:overflow-x-visible md:pb-0">
          {steps.map((step, idx) => (
            <Fragment key={step.key}>
              {/* Step card */}
              <div className="group flex min-w-40 flex-1 flex-col overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) transition-all duration-200 hover:border-(--color-primary)/50 hover:shadow-lg md:min-w-0">
                {/* Step number badge */}
                <div className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-[11px] font-extrabold text-white">
                    {idx + 1}
                  </span>
                  <span className="truncate text-xs font-bold text-(--color-text-primary)">
                    {step.label}
                  </span>
                </div>

                {/* Fixed Square Image Frame */}
                <button
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden bg-white/90"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.image}
                    alt={step.label}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </div>
                </button>

                {/* Uniform Description Area */}
                <div className="flex flex-1 flex-col justify-start px-3 py-2.5">
                  <p className="line-clamp-3 min-h-11 text-[11px] leading-relaxed text-(--color-text-muted)">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow connector between cards */}
              {idx < steps.length - 1 && (
                <div className="hidden items-center justify-center md:flex">
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--color-primary)/60" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <div className="mt-3 text-center md:hidden">
          <span className="text-[10px] font-semibold text-(--color-text-muted)">
            ← Geser untuk melihat semua tahap →
          </span>
        </div>
      </div>

      {/* Lightbox modal rendered via Portal to document.body */}
      {mounted &&
        lightbox !== null &&
        steps[lightbox] &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview: ${steps[lightbox].label}`}
          >
            <div
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-3 right-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Nav arrows */}
              {steps.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute top-1/2 left-3 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute top-1/2 right-3 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Fixed Lightbox Frame (Uniform Height & Centered) */}
              <div className="relative flex h-85 w-full items-center justify-center bg-white/95 sm:h-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={steps[lightbox].image}
                  alt={steps[lightbox].label}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Caption bar */}
              <div className="border-t border-(--color-border) bg-(--color-background) px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-[11px] font-extrabold text-white">
                    {lightbox + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-(--color-text-primary)">
                      {steps[lightbox].label}
                    </p>
                    <p className="text-xs text-(--color-text-muted)">
                      {steps[lightbox].description}
                    </p>
                  </div>
                </div>
                {/* Step dots */}
                <div className="mt-3 flex justify-center gap-1.5">
                  {steps.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setLightbox(i)}
                      className={`h-2 cursor-pointer rounded-full transition-all duration-200 ${
                        i === lightbox
                          ? "w-6 bg-(--color-primary)"
                          : "w-2 bg-(--color-border) hover:bg-(--color-text-muted)"
                      }`}
                      aria-label={`View step ${i + 1}: ${s.label}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
