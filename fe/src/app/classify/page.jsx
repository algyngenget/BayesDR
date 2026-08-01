"use client";

import { useRef, useEffect } from "react";
import { DR_CLASSES } from "@/libs/constant";
import { Sparkles } from "lucide-react";
import useClassifyStore from "@/services/store";
import UploadPanel from "./components/UploadPanel";
import ResultsDashboard from "./components/ResultsDashboard";

const CLASS_BAR_COLORS = [
  "#10b981", // No DR
  "#f59e0b", // Mild
  "#f97316", // Moderate
  "#ef4444", // Severe
  "#e11d48", // Proliferate DR
];

export default function ClassifyPage() {
  const {
    selectedImage,
    n_iterations,
    setIterations,
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
      const timerId = setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timerId);
    }
  }, [result]);

  // Auto-scroll ke input image ketika imagePreview berubah
  useEffect(() => {
    if (imagePreview && imageSectionRef.current) {
      const timerId = setTimeout(() => {
        imageSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return () => clearTimeout(timerId);
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
      setError("Format file tidak valid. Upload gambar (PNG, JPG, WEBP).");
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
        imageSectionRef.current?.scrollIntoView({
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

        <UploadPanel
          imageSectionRef={imageSectionRef}
          fileInputRef={fileInputRef}
          imagePreview={imagePreview}
          selectedImage={selectedImage}
          n_iterations={n_iterations}
          setIterations={setIterations}
          isLoading={isLoading}
          error={error}
          onImageSelect={handleImageSelect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClassify={handleClassify}
          onReset={handleReset}
          onLoadSample={loadSampleImageByFile}
        />

        <ResultsDashboard
          resultSectionRef={resultSectionRef}
          isLoading={isLoading}
          result={result}
          imagePreview={imagePreview}
          chartData={chartData}
        />
      </div>
    </div>
  );
}
