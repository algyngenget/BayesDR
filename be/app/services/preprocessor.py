import io
import cv2
import numpy as np
from PIL import Image

cv2.setNumThreads(0)


def _crop_tight_retina(img, thresh=10):
    """
    Memotong gambar tepat di batas terluar retina (tight bounding box)
    tanpa menambahkan padding buatan.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    mask = gray > thresh

    if not np.any(mask):
        return img  # Fallback jika gambar hitam murni

    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)

    # Pastikan bounding box valid
    if (y1 - y0) < 10 or (x1 - x0) < 10:
        return img

    return img[y0:y1, x0:x1]


def _denoise(img, ksize=3):
    return cv2.medianBlur(img, ksize)


def _clahe_green_channel(img_rgb, clip_limit=2.5, tile=(8, 8)):
    r, g, b = cv2.split(img_rgb)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile)
    g_eq = clahe.apply(g)
    return cv2.merge((r, g_eq, b))


def _local_average_subtract(img, sigma_fraction=30):
    sigma = max(img.shape[0], img.shape[1]) / sigma_fraction
    blurred = cv2.GaussianBlur(img, (0, 0), sigma)
    out = cv2.addWeighted(img, 4, blurred, -4, 128)
    return out


def _circular_mask(img, radius_fraction=0.93):
    """
    Membuat topeng lingkaran rapi (93%) untuk membuang artefak tepi
    dan memaksa latar belakang di luar lingkaran menjadi hitam murni (0,0,0).
    """
    h, w = img.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    center = (w // 2, h // 2)
    radius = int(min(h, w) / 2 * radius_fraction)

    cv2.circle(mask, center, radius, 255, -1)
    out = cv2.bitwise_and(img, img, mask=mask)
    return out


def preprocess_image(img_rgb, img_size=224, radius_fraction=0.86, debug_stats=None):
    """
    Pipeline Robust:
    1. Tight Crop -> 2. Direct Resize (Memenuhi Frame) -> 3. Denoise
    -> 4. CLAHE -> 5. Ben Graham -> 6. Circular Mask (Smooth Edge)
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
        # 1. Potong pas pada area retina (membuang margin hitam bawaan)
        cropped = _crop_tight_retina(img_rgb, thresh=10)

        # 2. Resize langsung ke (224, 224) agar retina memenuhi bingkai tanpa padding abu-abu
        img_rgb = cv2.resize(
            cropped, (img_size, img_size), interpolation=cv2.INTER_AREA
        )

        # 3. Denoising
        img_rgb = _denoise(img_rgb, ksize=3)

        # 4. CLAHE Enhancement (Green Channel)
        img_rgb = _clahe_green_channel(img_rgb, clip_limit=2.5, tile=(8, 8))

        # 5. Normalisasi Iluminasi (Ben Graham Subtraction)
        img_rgb = _local_average_subtract(img_rgb, sigma_fraction=30)

        # 6. Circular Masking (93%) untuk merapikan tepi dan memastikan background 100% hitam
        img_rgb = _circular_mask(img_rgb, radius_fraction=radius_fraction)

    except Exception as e:
        img_rgb = cv2.resize(
            original, (img_size, img_size), interpolation=cv2.INTER_AREA
        )
        if debug_stats is not None:
            debug_stats["failed"] = debug_stats.get("failed", 0) + 1
            debug_stats.setdefault("errors", []).append(str(e))

    return img_rgb
