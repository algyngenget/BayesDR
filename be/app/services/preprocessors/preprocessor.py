import base64
import io

import cv2
import numpy as np
from PIL import Image

cv2.setNumThreads(0)


def _numpy_to_base64_png(img_rgb: np.ndarray) -> str:
    """Convert a NumPy RGB array to a base64-encoded PNG data URI."""
    img_pil = Image.fromarray(img_rgb)
    buf = io.BytesIO()
    img_pil.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def crop_image_from_gray(
    img_rgb: np.ndarray, crop_thresh: int = 7, min_crop_dim: int = 10
) -> np.ndarray:
    """
    Crop area gelap (uninformative) menggunakan mask grayscale yang
    diterapkan konsisten ke SEMUA channel sekaligus (bukan per-channel
    terpisah, yang bisa membuat R/G/B tidak selaras).
    Ada fallback aman: jika gambar terlalu gelap sehingga hasil crop
    kosong/terlalu kecil, kembalikan gambar asli — mencegah error
    dimensi-0 saat inference pada gambar adversarial/sangat gelap.
    """
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    mask = gray > crop_thresh

    if not np.any(mask):
        return img_rgb  # gambar terlalu gelap, jangan di-crop

    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1  # +1 karena slicing eksklusif di ujung atas

    if (y1 - y0) < min_crop_dim or (x1 - x0) < min_crop_dim:
        return img_rgb  # hasil crop tidak masuk akal, fallback ke original

    return img_rgb[y0:y1, x0:x1]


def circle_crop(img_rgb: np.ndarray) -> np.ndarray:
    """
    Opsional: masking melingkar mengikuti bentuk retina untuk membuang
    noise di sudut gambar persegi. Trade-off: berisiko memotong lesi
    yang berada di tepi retina, sehingga default TIDAK diaktifkan.
    """
    h, w = img_rgb.shape[:2]
    x, y = w // 2, h // 2
    r = min(x, y)

    circle_mask = np.zeros((h, w), np.uint8)
    cv2.circle(circle_mask, (x, y), r, 1, thickness=-1)
    return cv2.bitwise_and(img_rgb, img_rgb, mask=circle_mask)


def preprocess_image(
    img_rgb,
    img_size: int = 224,
    crop_thresh: int = 7,
    sigma: int = 10,
    use_circle_crop: bool = False,
    debug_stats: dict = None,
) -> np.ndarray:
    """
    Implementasi Preprocessing BEN (Brightness Enhancement Normalization) - revisi

    Langkah:
    1. Gray Area Cropping — mask grayscale, konsisten antar-channel,
       dengan fallback anti-crash untuk gambar sangat gelap
    2. Resizing ke (img_size, img_size)
    3. (Opsional) Circle crop untuk membuang sudut — default nonaktif
       karena berisiko memotong lesi di tepi retina
    4. BEN: Brightness & Contrast Normalization
       (4 * img - 4 * blurred + 128); sigma default 10 mengikuti nilai
       asli Ben Graham — nilai besar (30-50) lebih cocok untuk
       visualisasi/estetika, bukan untuk training model
    """
    if isinstance(img_rgb, bytes):
        img_pil = Image.open(io.BytesIO(img_rgb))
        img_rgb = np.array(img_pil.convert("RGB"))
    elif isinstance(img_rgb, Image.Image):
        img_rgb = np.array(img_rgb.convert("RGB"))
    elif isinstance(img_rgb, np.ndarray):
        img_rgb = img_rgb.copy()
    else:
        raise ValueError(f"Unsupported image input type: {type(img_rgb)}")

    original = img_rgb.copy()
    try:
        # LANGKAH 1: Gray Area Cropping
        cropped = crop_image_from_gray(img_rgb, crop_thresh=crop_thresh)

        # LANGKAH 2: Resize ke ukuran seragam
        resized = cv2.resize(
            cropped, (img_size, img_size), interpolation=cv2.INTER_AREA
        )

        # LANGKAH 3: (Opsional) Circle crop
        if use_circle_crop:
            resized = circle_crop(resized)

        # LANGKAH 4: BEN - Brightness & Contrast Normalization
        blurred = cv2.GaussianBlur(resized, (0, 0), sigma)
        ben_img = cv2.addWeighted(resized, 4, blurred, -4, 128)

        return ben_img

    except Exception as e:
        if debug_stats is not None:
            debug_stats["failed"] = debug_stats.get("failed", 0) + 1
            debug_stats.setdefault("errors", []).append(str(e))
        # Fallback jika terjadi kesalahan tak terduga
        return cv2.resize(original, (img_size, img_size), interpolation=cv2.INTER_AREA)


def preprocess_image_with_steps(
    img_rgb,
    img_size: int = 224,
    crop_thresh: int = 7,
    sigma: int = 10,
    use_circle_crop: bool = False,
) -> list[dict]:
    """Run the preprocessing pipeline and capture each step as a base64 image.

    Returns a list of dicts, each with:
        - key:         machine-readable step identifier
        - label:       human-readable step name
        - description: short explanation of what the step does
        - image:       base64-encoded PNG data URI
    Only steps that are actually executed are included, keeping the
    list flexible for future pipeline changes.
    """
    # --- Decode input to NumPy RGB ---
    if isinstance(img_rgb, bytes):
        img_pil = Image.open(io.BytesIO(img_rgb))
        img_rgb = np.array(img_pil.convert("RGB"))
    elif isinstance(img_rgb, Image.Image):
        img_rgb = np.array(img_rgb.convert("RGB"))
    elif isinstance(img_rgb, np.ndarray):
        img_rgb = img_rgb.copy()
    else:
        raise ValueError(f"Unsupported image input type: {type(img_rgb)}")

    steps: list[dict] = []

    # Step 1: Original image (resized for display — keep aspect ratio manageable)
    display_original = img_rgb.copy()
    steps.append(
        {
            "key": "original",
            "label": "Gambar Original",
            "description": "Citra fundus asli sebelum preprocessing.",
            "image": _numpy_to_base64_png(display_original),
        }
    )

    # Step 2: Gray area cropping
    cropped = crop_image_from_gray(display_original, crop_thresh=crop_thresh)
    steps.append(
        {
            "key": "cropped",
            "label": "Gray Area Cropping",
            "description": "Area gelap (uninformative) di-crop menggunakan mask grayscale.",
            "image": _numpy_to_base64_png(cropped),
        }
    )

    # Step 3: Resize
    resized = cv2.resize(cropped, (img_size, img_size), interpolation=cv2.INTER_AREA)
    steps.append(
        {
            "key": "resized",
            "label": "Resized",
            "description": f"Gambar di-resize ke ukuran seragam {img_size}×{img_size} piksel.",
            "image": _numpy_to_base64_png(resized),
        }
    )

    # Step 4 (Opsional): Circle crop — hanya jika diaktifkan
    if use_circle_crop:
        resized = circle_crop(resized)
        steps.append(
            {
                "key": "circle_crop",
                "label": "Circle Crop",
                "description": "Masking melingkar mengikuti bentuk retina, membuang noise di sudut.",
                "image": _numpy_to_base64_png(resized),
            }
        )

    # Step 5: BEN normalization
    blurred = cv2.GaussianBlur(resized, (0, 0), sigma)
    ben_img = cv2.addWeighted(resized, 4, blurred, -4, 128)
    steps.append(
        {
            "key": "ben_result",
            "label": "BEN Normalized",
            "description": "Brightness Enhancement Normalization (4×img − 4×blur + 128).",
            "image": _numpy_to_base64_png(ben_img),
        }
    )

    return steps
