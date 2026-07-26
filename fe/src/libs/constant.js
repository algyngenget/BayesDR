export const DR_CLASSES = [
  {
    name: "No_DR",
    label: "No DR",
    color: "bg-(--color-status-success)",
    textColor: "text-(--color-status-success)",
    bgColor: "bg-(--color-status-success)/10",
    borderColor: "border-(--color-status-success)",
    description:
      "Tidak ada tanda Diabetic Retinopathy terdeteksi. Retina dalam kondisi sehat.",
  },
  {
    name: "Mild",
    label: "Mild",
    color: "bg-(--color-status-warning)",
    textColor: "text-(--color-status-warning)",
    bgColor: "bg-(--color-status-warning)/10",
    borderColor: "border-(--color-status-warning)",
    description:
      "Tahap awal dengan microaneurysms. Disarankan untuk pemeriksaan rutin setiap 12 bulan.",
  },
  {
    name: "Moderate",
    label: "Moderate",
    color: "bg-(--color-status-danger)",
    textColor: "text-(--color-status-danger)",
    bgColor: "bg-(--color-status-danger)/10",
    borderColor: "border-(--color-status-danger)",
    description:
      "Tahap menengah. Perlu pemantauan lebih intensif dan konsultasi dengan dokter mata.",
  },
  {
    name: "Severe",
    label: "Severe",
    color: "bg-(--color-status-severe)",
    textColor: "text-(--color-status-severe)",
    bgColor: "bg-(--color-status-severe)/10",
    borderColor: "border-(--color-status-severe)",
    description:
      "Tahap lanjut. Segera konsultasikan dengan dokter mata spesialis untuk penanganan.",
  },
  {
    name: "Proliferate_DR",
    label: "Proliferate DR",
    color: "bg-(--color-status-critical)",
    textColor: "text-(--color-status-critical)",
    bgColor: "bg-(--color-status-critical)/10",
    borderColor: "border-(--color-status-critical)",
    description:
      "Tahap paling parah. Memerlukan penanganan medis segera untuk mencegah kebutaan.",
  },
];

// List of real sample images in /public/sample_images
export const SAMPLE_IMAGES = [
  { label: "No DR", file: "no_dr.jpg", category: "No DR" },
  { label: "Mild", file: "mild.jpg", category: "Mild" },
  { label: "Moderate", file: "moderate.jpg", category: "Moderate" },
  { label: "Severe", file: "severe2.jpg", category: "Severe" },
  {
    label: "Proliferative",
    file: "proliferate.jpg",
    category: "Proliferative",
  },
];
