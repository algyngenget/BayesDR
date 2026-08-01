/* eslint-disable no-console */
import { create } from "zustand";
import api from "./api";

const useClassifyStore = create((set, get) => ({
  selectedImage: null,
  n_iterations: 25,
  imagePreview: null,
  isLoading: false,
  result: null,
  error: null,

  setError: (error) => set({ error }),

  setImage: (file) => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      set({
        error: `File terlalu besar (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maksimal 10MB.`,
      });
      return false;
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/bmp"];
    if (!validTypes.includes(file.type)) {
      set({ error: "Format file tidak didukung. Gunakan PNG, JPG, JPEG" });
      return false;
    }

    // Release old preview URL
    const oldPreview = get().imagePreview;
    if (oldPreview) {
      URL.revokeObjectURL(oldPreview);
    }

    set({
      selectedImage: file,
      imagePreview: URL.createObjectURL(file),
      result: null,
      error: null,
    });
    return true;
  },

  classifyImage: async () => {
    const { selectedImage, n_iterations } = get();
    if (!selectedImage || Number(n_iterations) < 1) return;

    set({ isLoading: true, error: null, result: null });

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("n_iterations", n_iterations);

    try {
      console.log("📤 Sending request to backend...");
      console.log(`   File: ${selectedImage.name}`);
      console.log(`   Size: ${(selectedImage.size / 1024).toFixed(2)} KB`);
      console.log(`   Forward Pass (n_iterations): ${n_iterations}`);

      const response = await api.classifyImage(formData);

      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || "Klasifikasi gagal");
      }

      console.log(" Prediction successful:", data);
      set({ result: data, isLoading: false });
    } catch (err) {
      console.error(" Classification error:", err);
      let errorMsg = err.message || "Gagal melakukan klasifikasi";
      if (err.response) {
        errorMsg =
          err.response.data?.message || err.response.data?.error || errorMsg;
      } else if (err.message.includes("Network Error")) {
        errorMsg =
          "Tidak dapat terhubung ke server. Pastikan backend berjalan di " +
          process.env.NEXT_PUBLIC_API_URL;
      }
      set({ error: errorMsg, isLoading: false });
    }
  },

  setIterations: (n_iter) => {
    set({ n_iterations: n_iter });
  },

  reset: () => {
    const oldPreview = get().imagePreview;
    if (oldPreview) {
      URL.revokeObjectURL(oldPreview);
    }
    set({
      selectedImage: null,
      n_iterations: 25,
      imagePreview: null,
      result: null,
      error: null,
    });
  },
}));

export default useClassifyStore;
