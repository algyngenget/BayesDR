"""PyTorch Bayesian CNN Model definition and MC Dropout uncertainty estimation."""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms

# Class labels
CLASS_NAMES = ["No_DR", "Mild", "Moderate", "Severe", "Proliferate_DR"]

labels = {
    "No_DR": "No Diabetic Retinopathy",
    "Mild": "Mild Diabetic Retinopathy",
    "Moderate": "Moderate Diabetic Retinopathy",
    "Severe": "Severe Diabetic Retinopathy",
    "Proliferate_DR": "Proliferative Diabetic Retinopathy",
}

NUM_CLASSES = 5
DROPOUT_RATE = 0.3
DROPOUT_P = 0.3  # Backward compatibility alias
HIDDEN_DIM = 256
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Evaluation transform (ImageNet normalization)
eval_transform = transforms.Compose(
    [
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ]
)

train_transform = transforms.Compose(
    [
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ]
)


class MCDropout(nn.Dropout):
    """
    Monte Carlo Dropout Layer:
    Memaksa fungsionalitas Dropout tetap AKTIF (training=True)
    bahkan ketika model berada dalam mode evaluasi (model.eval()).
    """

    def forward(self, x):
        return F.dropout(x, p=self.p, training=True, inplace=self.inplace)


class DenseNet121Head(nn.Module):
    """
    BCNN Model with DenseNet-121 backbone + MC Dropout Head.
    Set use_mc_dropout=False digunakan untuk varian deterministic.
    """

    def __init__(
        self,
        num_classes: int = NUM_CLASSES,
        hidden_dim: int = HIDDEN_DIM,
        dropout_rate: float = DROPOUT_RATE,
        use_mc_dropout: bool = True,
        pretrained: bool = False,
    ):
        super().__init__()
        weights = models.DenseNet121_Weights.IMAGENET1K_V1 if pretrained else None
        backbone = models.densenet121(weights=weights)
        self.features = backbone.features  # include_top=False
        in_features = backbone.classifier.in_features  # 1024

        self.gap = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout1 = nn.Dropout(p=dropout_rate) if use_mc_dropout else nn.Identity()
        self.bn = nn.BatchNorm1d(in_features)
        self.fc1 = nn.Linear(in_features, hidden_dim)
        self.relu = nn.ReLU(inplace=True)
        self.dropout2 = nn.Dropout(p=dropout_rate) if use_mc_dropout else nn.Identity()
        self.fc2 = nn.Linear(hidden_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = F.relu(x, inplace=True)  # feature map akhir
        x = self.gap(x)  # GAP
        x = torch.flatten(x, 1)
        x = self.dropout1(x)
        x = self.bn(x)
        x = self.fc1(x)
        x = self.relu(x)
        x = self.dropout2(x)
        return self.fc2(x)  # Dense 5


# Aliases for backward compatibility
BayesianDenseNet121 = DenseNet121Head
BayesianDRNet = DenseNet121Head


def build_model(
    model_type: str = "bayesian",
    num_classes: int = NUM_CLASSES,
    hidden_dim: int = HIDDEN_DIM,
    dropout_rate: float = DROPOUT_RATE,
    pretrained: bool = False,
) -> DenseNet121Head:
    """model_type in {'deterministic', 'bayesian'}"""
    return DenseNet121Head(
        num_classes=num_classes,
        hidden_dim=hidden_dim,
        dropout_rate=dropout_rate,
        use_mc_dropout=(model_type == "bayesian"),
        pretrained=pretrained,
    )


def enable_mc_dropout(model: nn.Module):
    """
    Set model ke eval mode (agar BatchNorm memakai running stats dan stabil pada batch size 1),
    TAPI mengaktifkan kembali seluruh layer Dropout untuk stochastic forward passes.
    """
    model.eval()
    for m in model.modules():
        if isinstance(m, (nn.Dropout, nn.Dropout2d, MCDropout)):
            m.train()


@torch.no_grad()
def mc_dropout_predict(model: nn.Module, x: torch.Tensor, T: int = 25) -> dict:
    """
    Melakukan T kali forward pass Monte Carlo Dropout
    dan menghitung Predictive Entropy, Aleatoric Entropy, serta Epistemic Uncertainty (MI/BALD).

    Args:
        model: Model PyTorch (DenseNet121Head)
        x: Input image tensor (shape: (B, C, H, W))
        T: Jumlah iterasi Monte Carlo sampling

    Returns:
        dict berisi mean_probs, std_probs, predictive_entropy, aleatoric_entropy, epistemic_uncertainty
    """
    model.eval()  # Freeze BatchNorm running statistics
    enable_mc_dropout(model)  # Aktifkan khusus layer Dropout

    probs_samples = []
    for _ in range(T):
        logits = model(x)
        probs = F.softmax(logits, dim=1)
        probs_samples.append(probs)

    # Tensor shape: (T, Batch_size, Num_classes)
    probs_samples = torch.stack(probs_samples, dim=0)

    # Mean & Std probability over T samples
    mean_probs = probs_samples.mean(dim=0)  # (Batch_size, Num_classes)
    std_probs = probs_samples.std(dim=0)  # (Batch_size, Num_classes)

    eps = 1e-12
    # Clamping probabilitas agar aman dari log(0)
    mean_probs_clamped = torch.clamp(mean_probs, eps, 1.0 - eps)
    probs_samples_clamped = torch.clamp(probs_samples, eps, 1.0 - eps)

    # 1. Total Predictive Entropy: H[P(y|x)] = - sum(mean_p * log(mean_p))
    predictive_entropy = -(mean_probs_clamped * torch.log(mean_probs_clamped)).sum(
        dim=1
    )  # (Batch_size,)

    # 2. Aleatoric Uncertainty: E[H[P(y|x, w)]] (Rata-rata entropy per-sample)
    per_sample_entropy = -(
        probs_samples_clamped * torch.log(probs_samples_clamped)
    ).sum(dim=2)  # (T, Batch_size)
    aleatoric_entropy = per_sample_entropy.mean(dim=0)  # (Batch_size,)

    # 3. Epistemic Uncertainty (BALD / Mutual Information) = max(0, Predictive - Aleatoric)
    epistemic_uncertainty = torch.clamp(predictive_entropy - aleatoric_entropy, min=0.0)

    return {
        "mean_probs": mean_probs,
        "std_probs": std_probs,
        "predictive_entropy": predictive_entropy,
        "aleatoric_entropy": aleatoric_entropy,
        "epistemic_uncertainty": epistemic_uncertainty,
    }

