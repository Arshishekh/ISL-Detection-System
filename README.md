# ✋ SignBridge - Indian Sign Language (ISL) Detection & Conversion System

An interactive web-based application designed to bridge communication gaps by translating Indian Sign Language (ISL) gestures into readable text and real-time speech output.

---

## 🚀 Features

* **Real-Time Hand Tracking & Inference:** Powered by MediaPipe Vision Tasks and custom neural network weights (`keras_model.h5`) for precise gesture recognition.
* **Live Camera Feed:** Interactive webcam integration with visual landmark detection overlays.
* **Text-to-Speech (TTS):** Converts recognized sign sequences into audible speech using browser speech APIs[cite: 4].
* **Activity History & Logging:** Keeps track of translated sessions and clipboard actions locally[cite: 4].

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Glassmorphism & Neon UI), Vanilla JavaScript[cite: 4]
* **AI / Machine Learning:** MediaPipe HandLandmarker, TensorFlow / Keras (`keras_model.h5`, `labels.txt`)[cite: 4]
* **Deployment:** Netlify / GitHub Pages[cite: 3]

---

## 📁 Project Structure

```text
ISL-Detection-System/
│
├── converted_keras/     # Trained Keras model weights and labels
│   ├── keras_model.h5
│   └── labels.txt
├── css/                 # Stylesheets (detection.css, dashboard.css)
├── js/                  # Application logic & inference pipeline (detection.js)
├── detection.html       # Main workspace interface
├── dashboard.html       # User dashboard navigation
└── README.md
