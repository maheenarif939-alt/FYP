import io
import os
from PIL import Image

_model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml_models', 'best.pt')


def get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO(MODEL_PATH)
    return _model


def predict_disease(image_bytes):
    model = get_model()
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')

    results = model.predict(img, conf=0.1, verbose=False)
    r = results[0]

    box_count = 0 if r.boxes is None else len(r.boxes)
    print(f"[AI] Image size: {img.size} | Boxes detected: {box_count}")

    if r.boxes is None or box_count == 0:
        return None, 0.0

    confs = r.boxes.conf.tolist()
    clss = r.boxes.cls.tolist()
    best_idx = confs.index(max(confs))
    class_id = int(clss[best_idx])
    confidence = float(confs[best_idx])
    name = model.names[class_id]

    print(f"[AI] Prediction: {name} ({confidence:.2f})")
    return name, confidence