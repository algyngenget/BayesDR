"""User routes - User management endpoints"""

import traceback

from flask import Blueprint, jsonify, request

from app.services.classifier import get_prediction_explanation, predict_with_uncertainty

classify_bp = Blueprint("classify", __name__, url_prefix="/api/classify")


@classify_bp.route("/", methods=["POST"])
def classify():
    """
    Classify a fundus image for Diabetic Retinopathy.

    Expects: multipart/form-data with 'image' file
    Returns: JSON with prediction, confidence, uncertainty, and probabilities
    """
    try:
        # ✅ Validate request has Forward Pass iterations
        if "n_iterations" not in request.form:
            return jsonify(
                {
                    "success": False,
                    "error": "No forward pass iterations",
                    "message": "Please add forward pass iterations in 'n_iterations' field",
                }
            ), 400

        n_iterations = int(request.form["n_iterations"])

        # ✅ Validate Forward Pass iterations
        if n_iterations < 1:
            return jsonify(
                {
                    "success": False,
                    "error": "Invalid number of forward pass",
                    "message": "Please pick a forward pass number from 1 or above",
                }
            ), 400

        # ✅ Validate request has files
        if "image" not in request.files:
            return jsonify(
                {
                    "success": False,
                    "error": "No image uploaded",
                    "message": "Please upload an image file in 'image' field",
                }
            ), 400

        file = request.files["image"]

        # ✅ Check if file is empty
        if file.filename == "":
            return jsonify(
                {
                    "success": False,
                    "error": "Empty filename",
                    "message": "Please select a valid image file",
                }
            ), 400

        # ✅ Check file extension
        allowed_extensions = {"png", "jpg", "jpeg", "bmp", "tiff", "webp"}
        file_ext = (
            file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        )

        if file_ext not in allowed_extensions:
            return jsonify(
                {
                    "success": False,
                    "error": "Invalid file type",
                    "message": f"Allowed types: {', '.join(allowed_extensions).upper()}",
                    "received": file_ext,
                }
            ), 400

        # ✅ Check file size (optional - max 10MB)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()  # Get size
        file.seek(0)  # Reset to start

        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            return jsonify(
                {
                    "success": False,
                    "error": "File too large",
                    "message": f"Maximum file size is 10MB. Your file: {file_size / (1024 * 1024):.2f}MB",
                }
            ), 400

        print(f"\n{'=' * 70}")
        print(f"[INFO] Received image: {file.filename}")
        print(f"   Size: {file_size / 1024:.2f} KB")
        print(f"   Type: {file_ext}")
        print(f"{'=' * 70}")

        # Read image bytes
        image_bytes = file.read()

        # Validate image bytes
        if len(image_bytes) == 0:
            return jsonify(
                {
                    "success": False,
                    "error": "Empty file",
                    "message": "The uploaded file appears to be empty",
                }
            ), 400

        print(f"[INFO] Image loaded: {len(image_bytes)} bytes")

        # Get prediction with uncertainty
        print(f"[INFO] Starting prediction with {n_iterations} iterations...")
        result = predict_with_uncertainty(image_bytes, n_iterations=n_iterations)

        # Add explanation
        explanation = get_prediction_explanation(result)
        result["explanation"] = explanation

        # Add metadata
        result["success"] = True
        result["filename"] = file.filename
        result["file_size_kb"] = round(file_size / 1024, 2)
        result["n_iterations"] = n_iterations

        print("\n[SUCCESS] Prediction completed!")
        print(f"   Result: {result['class_name']}")
        print(f"   Confidence: {result['confidence']:.2%}")
        print(f"   Uncertainty: {result['uncertainty']:.4f}")
        print(f"{'=' * 70}\n")

        return jsonify(result), 200

    except ValueError as e:
        # Preprocessing or validation errors
        error_msg = str(e)
        print(f"\n[ERROR] ValueError: {error_msg}")

        return jsonify(
            {
                "success": False,
                "error": "Invalid image",
                "message": error_msg,
                "details": "The image could not be processed. Please check the file format.",
            }
        ), 400

    except Exception as e:
        # Unexpected errors
        error_msg = str(e)
        error_trace = traceback.format_exc()

        print("\n[ERROR] PREDICTION ERROR:")
        print(error_trace)

        return jsonify(
            {
                "success": False,
                "error": "Prediction failed",
                "message": error_msg,
                "details": "An unexpected error occurred during prediction. Check server logs.",
            }
        ), 500
