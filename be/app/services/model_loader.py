"""Thread-safe singleton model loader and checkpoint manager for PyTorch DenseNet121Head."""

import os
import threading

import torch
from flask import current_app

from app.services.model import (
    DROPOUT_RATE,
    HIDDEN_DIM,
    NUM_CLASSES,
    DenseNet121Head,
)

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
    Load the trained PyTorch DenseNet121Head model state dict with singleton caching.
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
            model = DenseNet121Head(
                num_classes=NUM_CLASSES,
                hidden_dim=HIDDEN_DIM,
                dropout_rate=DROPOUT_RATE,
                use_mc_dropout=True,
                pretrained=False,
            )

            ckpt = torch.load(MODEL_PATH, map_location=device, weights_only=False)
            state_dict = None
            if isinstance(ckpt, dict):
                if "model_state_dict" in ckpt:
                    state_dict = ckpt["model_state_dict"]
                elif "state_dict" in ckpt:
                    state_dict = ckpt["state_dict"]
                else:
                    state_dict = ckpt
            else:
                model = ckpt

            if state_dict is not None:
                # Handle possible prefix adjustments if legacy model was saved with 'backbone.'
                if any(k.startswith("backbone.") for k in state_dict.keys()):
                    new_state = {}
                    for k, v in state_dict.items():
                        new_key = k.replace("backbone.", "")
                        new_state[new_key] = v
                    state_dict = new_state
                model.load_state_dict(state_dict, strict=False)

            model.to(device)
            model.eval()

            print("[SUCCESS] PyTorch BCNN model loaded successfully!")
            _model = model

        except Exception as e:
            print(f"[ERROR] Error loading model: {str(e)}")
            raise

    return _model

