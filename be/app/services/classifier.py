"""High-level classification service for Diabetic Retinopathy prediction and uncertainty estimation."""

import numpy as np
from app.services.model import (
    CLASS_NAMES,
    IMG_SIZE,
    eval_transform,
    labels,
    mc_dropout_predict,
)
from app.services.model_loader import get_device, load_model
from app.services.preprocessor import preprocess_image


def prepare_image_tensor(image_bytes):
    """Preprocess uploaded image bytes using 7-stage retinal preprocessor

    and transform to PyTorch tensor.
    """
    try:
        processed_np = preprocess_image(image_bytes, img_size=IMG_SIZE)
        img_tensor = eval_transform(processed_np)
        img_tensor = img_tensor.unsqueeze(0)  # Shape: (1, 3, 224, 224)
        return img_tensor
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}") from None


def predict_with_uncertainty(image_bytes, n_iterations=25):
    """Make a prediction with Monte Carlo Dropout uncertainty estimation.

    Args:
        image_bytes: Raw bytes of the uploaded image.
        n_iterations: Number of stochastic forward passes (default: 25).

    Returns:
        Dictionary with prediction + uncertainty metrics.
    """
    try:
        model = load_model()
        device = get_device()

        img_tensor = prepare_image_tensor(image_bytes).to(device)

        print(f"🔄 Running MC Dropout (T={n_iterations})...")
        mc_res = mc_dropout_predict(model, img_tensor, T=n_iterations)

        mean_probs = mc_res["mean_probs"][0].cpu().numpy()
        std_probs = mc_res["std_probs"][0].cpu().numpy()
        predictive_entropy = float(mc_res["predictive_entropy"][0].cpu().item())
        aleatoric_entropy = float(mc_res["aleatoric_entropy"][0].cpu().item())
        epistemic_uncertainty = float(mc_res["epistemic_uncertainty"][0].cpu().item())

        predicted_class = int(np.argmax(mean_probs))
        predicted_class_name = CLASS_NAMES[predicted_class]
        confidence = float(mean_probs[predicted_class])

        class_uncertainty = float(std_probs[predicted_class])
        overall_uncertainty = float(np.mean(std_probs))

        confidence_level = (
            "High" if confidence >= 0.8 else "Medium" if confidence >= 0.6 else "Low"
        )
        uncertainty_level = (
            "Low"
            if overall_uncertainty <= 0.05
            else "Medium"
            if overall_uncertainty <= 0.10
            else "High"
        )

        print("\n📊 Prediction Results:")
        print(f"   Class: {predicted_class_name}")
        print(f"   Confidence: {confidence:.2%}")
        print(f"   Uncertainty (mean std): {overall_uncertainty:.4f}")
        print(f"   Predictive Entropy: {predictive_entropy:.4f}")
        print(f"   Epistemic Uncertainty: {epistemic_uncertainty:.4f}")

        return {
            "predicted_class": predicted_class,
            "class_name": predicted_class_name,
            "class_label": labels[predicted_class_name],
            "confidence": confidence,
            "confidence_level": confidence_level,
            "uncertainty": overall_uncertainty,
            "class_uncertainty": class_uncertainty,
            "predictive_entropy": predictive_entropy,
            "aleatoric_entropy": aleatoric_entropy,
            "epistemic_uncertainty": epistemic_uncertainty,
            "uncertainty_level": uncertainty_level,
            "probabilities": [float(p) for p in mean_probs],
            "std_deviations": [float(s) for s in std_probs],
            "class_names": CLASS_NAMES,
            "n_iterations": n_iterations,
            "reliable_prediction": confidence >= 0.7 and overall_uncertainty <= 0.10,
        }

    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise


def get_prediction_explanation(result):
    """Generate a human-readable explanation of the prediction."""
    explanation = f"Diagnosis: {result['class_label']}\n"
    explanation += (
        f"Confidence: {result['confidence']:.1%} ({result['confidence_level']})\n"
    )
    explanation += (
        f"Uncertainty: {result['uncertainty']:.4f} ({result['uncertainty_level']})\n\n"
    )

    if result["reliable_prediction"]:
        explanation += (
            "✅ This is a reliable prediction (high confidence, low uncertainty).\n"
        )
    else:
        explanation += "⚠️ This prediction has "
        if result["confidence"] < 0.7:
            explanation += "low confidence"
        if result["confidence"] < 0.7 and result["uncertainty"] > 0.10:
            explanation += " and "
        if result["uncertainty"] > 0.10:
            explanation += "high uncertainty"
        explanation += ". Consider additional medical evaluation.\n"

    probs = result["probabilities"]
    top_3_indices = np.argsort(probs)[-3:][::-1]

    explanation += "\nTop 3 Predictions:\n"
    for idx in top_3_indices:
        explanation += f"  {CLASS_NAMES[idx]}: {probs[idx]:.1%}\n"

    return explanation
