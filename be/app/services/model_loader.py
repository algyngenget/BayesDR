"""Thread-safe singleton model loader and checkpoint manager for PyTorch BayesianDRNet."""

import os
import threading
from flask import current_app
import torch

from app.services.model import NUM_CLASSES, DROPOUT_P, BayesianDRNet

# Module-level cache
_model = None
_device = None
_model_lock = threading.Lock()


def get_device():
    """Return configured PyTorch device (cuda or cpu)."""
    global _device
    if _device is None:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return _device


def load_model():
    """
    Load the trained PyTorch BayesianDRNet model state dict with singleton caching.
    """
    global _model, _device

    if _model is not None:
        return _model

    with _model_lock:
        if _model is not None:
            return _model

        device = get_device()

        MODEL_NAME = current_app.config.get("MODEL_NAME", "BCNN")
        models_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "storage",
            "models",
        )

        possible_paths = [
            os.path.join(models_dir, f"{MODEL_NAME}.pt"),
            os.path.join(models_dir, f"{MODEL_NAME}.pth"),
            os.path.join(models_dir, "BCNN.pt"),
            os.path.join(models_dir, "BCNN_PyTorch_(2).pt"),
        ]

        MODEL_PATH = None
        for p in possible_paths:
            if os.path.exists(p):
                MODEL_PATH = p
                break

        if MODEL_PATH is None:
            raise FileNotFoundError(
                f"❌ Model file not found. Tried paths: {possible_paths}"
            )

        try:
            print(f"Loading PyTorch model from: {MODEL_PATH}")
            model = BayesianDRNet(
                num_classes=NUM_CLASSES, dropout_p=DROPOUT_P, pretrained=False
            )

            ckpt = torch.load(MODEL_PATH, map_location=device, weights_only=False)
            if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
                model.load_state_dict(ckpt["model_state_dict"])
            elif isinstance(ckpt, dict) and "state_dict" in ckpt:
                model.load_state_dict(ckpt["state_dict"])
            elif isinstance(ckpt, dict):
                model.load_state_dict(ckpt)
            else:
                model = ckpt

            model.to(device)
            model.eval()

            print("✅ PyTorch BCNN model loaded successfully!")
            _model = model

        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            raise

    return _model
