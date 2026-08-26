import io

import cv2
import numpy as np
from PIL import Image

cv2.setNumThreads(0)


def _detect_retina_circle(gray, thresh=7):
    mask = gray > thresh
    if mask.sum() == 0:
        return None
    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    return x0, y0, x1, y1


def _scale_radius(img, target_radius=300):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    row = gray[gray.shape[0] // 2, :]
    row_thresh = row > row.mean() / 10
    nz = np.nonzero(row_thresh)[0]
    if len(nz) < 2:
        return img
    current_radius = (nz[-1] - nz[0]) / 2
    if current_radius <= 1:
        return img
    scale = target_radius / current_radius
    scale = float(np.clip(scale, 0.1, 10.0))
    return cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)


def _circular_mask(img, radius_fraction=0.90):
    # standar Ben Graham: clip ke ~90% radius untuk buang artefak di tepi retina
    h, w = img.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    center = (w // 2, h // 2)
    radius = int(min(h, w) / 2 * radius_fraction)
    cv2.circle(mask, center, radius, 255, -1)
    out = cv2.bitwise_and(img, img, mask=mask)
    return out


def _denoise(img, ksize=3):
    # median filter ringan: buang noise SEBELUM contrast enhancement,
    # supaya CLAHE tidak ikut menguatkan noise-nya
    return cv2.medianBlur(img, ksize)


def _clahe_green_channel(img_rgb, clip_limit=2.5, tile=(8, 8)):
    # CLAHE khusus di green channel: channel ini punya kontras terbaik
    # untuk pembuluh darah & lesi pada fundus image. R & B dibiarkan
    # apa adanya supaya rekonstruksi RGB tetap valid untuk backbone
    # CNN pretrained (ResNet/DenseNet dkk mengharapkan input 3-channel).
    r, g, b = cv2.split(img_rgb)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile)
    g_eq = clahe.apply(g)
    return cv2.merge((r, g_eq, b))


def _local_average_subtract(img, sigma_fraction=30):
    # Ben Graham illumination normalization: img*4 - blur(img)*4 + 128
    sigma = max(img.shape[0], img.shape[1]) / sigma_fraction
    blurred = cv2.GaussianBlur(img, (0, 0), sigma)
    out = cv2.addWeighted(img, 4, blurred, -4, 128)
    return out


def preprocess_image(img_input, img_size=224, target_radius=300, debug_stats=None):
    """Full pipeline: crop -> radius normalize -> circular mask (90%) -> denoise
    -> CLAHE (green channel) -> Ben Graham illumination normalize -> resize.
    Falls back to the ORIGINAL image if any stage fails, to avoid discarding data.

    Args:
        img_input: RGB numpy array, PIL Image, or image bytes.
        img_size: Final output dimension (width and height).
        target_radius: Target radius for circle scaling.
        debug_stats: Optional dict to track failure statistics.
    """
    if isinstance(img_input, bytes):
        img_pil = Image.open(io.BytesIO(img_input))
        img_rgb = np.array(img_pil.convert("RGB"))
    elif isinstance(img_input, Image.Image):
        img_rgb = np.array(img_input.convert("RGB"))
    elif isinstance(img_input, np.ndarray):
        img_rgb = img_input.copy()
    else:
        raise ValueError(f"Unsupported image input type: {type(img_input)}")

    original = img_rgb.copy()  # simpan referensi ke input asli yang belum disentuh
    try:
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
        box = _detect_retina_circle(gray, thresh=7)
        if box is not None:
            x0, y0, x1, y1 = box
            if (x1 - x0) > 10 and (y1 - y0) > 10:
                img_rgb = img_rgb[y0:y1, x0:x1]
        img_rgb = _scale_radius(img_rgb, target_radius=target_radius)
        img_rgb = _circular_mask(img_rgb, radius_fraction=0.90)
        img_rgb = _denoise(img_rgb, ksize=3)
        img_rgb = _clahe_green_channel(img_rgb, clip_limit=2.5, tile=(8, 8))
        img_rgb = _local_average_subtract(img_rgb, sigma_fraction=30)
    except Exception as e:
        img_rgb = (
            original  # benar-benar kembali ke gambar asli, bukan array setengah-jadi
        )
        if debug_stats is not None:
            debug_stats["failed"] = debug_stats.get("failed", 0) + 1
            debug_stats.setdefault("errors", []).append(str(e))

    # square-pad before resize to avoid distortion
    h, w = img_rgb.shape[:2]
    side = max(h, w)
    padded = np.zeros((side, side, 3), dtype=img_rgb.dtype)
    y_off, x_off = (side - h) // 2, (side - w) // 2
    padded[y_off : y_off + h, x_off : x_off + w] = img_rgb
    out = cv2.resize(padded, (img_size, img_size), interpolation=cv2.INTER_AREA)
    return out
