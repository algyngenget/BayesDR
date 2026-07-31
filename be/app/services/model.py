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
DROPOUT_P = 0.3
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Evaluation transform (ImageNet normalization)
eval_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


class BayesianDRNet(nn.Module):
    """DenseNet-121 pretrained sebagai feature extractor + classifier head dengan
    Dropout. Dropout ini yang jadi 'Bayesian' approximation-nya (Gal & Ghahramani,
    MC Dropout): kalau tetap aktif saat inference dan di-sample berkali-kali,
    variasi antar sample merepresentasikan epistemic uncertainty model."""

    def __init__(self, num_classes=NUM_CLASSES, dropout_p=DROPOUT_P, pretrained=False):
        super().__init__()
        weights = models.DenseNet121_Weights.IMAGENET1K_V1 if pretrained else None
        backbone = models.densenet121(weights=weights)
        in_features = backbone.classifier.in_features  # 1024 utk densenet121
        backbone.classifier = nn.Identity()  # buang classifier bawaan, ambil fiturnya saja
        self.backbone = backbone
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout_p),
            nn.Linear(in_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_p),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        features = self.backbone(x)
        logits = self.classifier(features)
        return logits


def enable_mc_dropout(model: nn.Module):
    """Set model ke eval mode (BatchNorm pakai running stats), TAPI paksa semua
    layer nn.Dropout tetap aktif -> ini kunci MC Dropout saat inference."""
    model.eval()
    for module in model.modules():
        if isinstance(module, nn.Dropout):
            module.train()


@torch.no_grad()
def mc_dropout_predict(model: nn.Module, x: torch.Tensor, T: int = 25):
    """Jalankan T forward pass dengan dropout aktif, lalu hitung:
    - mean_probs            : rata-rata probabilitas softmax (prediksi akhir)
    - std_probs             : standar deviasi probabilitas antar sample
    - predictive_entropy    : total uncertainty (aleatoric + epistemic)
    - aleatoric_entropy     : rata-rata entropy tiap sample (uncertainty dari data)
    - epistemic_uncertainty : mutual information/BALD = predictive - aleatoric
    """
    enable_mc_dropout(model)
    probs_samples = []
    for _ in range(T):
        logits = model(x)
        probs = F.softmax(logits, dim=1)
        probs_samples.append(probs.unsqueeze(0))
    probs_samples = torch.cat(probs_samples, dim=0)  # (T, B, num_classes)

    mean_probs = probs_samples.mean(dim=0)  # (B, num_classes)
    std_probs = probs_samples.std(dim=0)  # (B, num_classes)

    eps = 1e-12
    predictive_entropy = -(mean_probs * torch.log(mean_probs + eps)).sum(dim=1)  # (B,)
    per_sample_entropy = -(probs_samples * torch.log(probs_samples + eps)).sum(dim=2)  # (T, B)
    aleatoric_entropy = per_sample_entropy.mean(dim=0)  # (B,)
    epistemic_uncertainty = predictive_entropy - aleatoric_entropy  # (B,) >= 0 secara teori

    return {
        "mean_probs": mean_probs,
        "std_probs": std_probs,
        "predictive_entropy": predictive_entropy,
        "aleatoric_entropy": aleatoric_entropy,
        "epistemic_uncertainty": epistemic_uncertainty,
    }
