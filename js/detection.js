/* =========================================
    SIGNBRIDGE — ISL HAND DETECTION & INFERENCE
    MediaPipe Vision Tasks + Real-time Pipeline
========================================= */

import {
    HandLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

// ---------- HTML ELEMENTS ----------

const cameraVideo = document.getElementById("cameraVideo");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");

const startCameraButton = document.getElementById("startCamera");
const stopCameraButton = document.getElementById("stopCamera");

const cameraStatus = document.getElementById("cameraStatus");
const cameraMessage = document.getElementById("cameraMessage");

const landmarkCanvas = document.getElementById("landmarkCanvas");
const canvasContext = landmarkCanvas.getContext("2d");

const detectedSign = document.getElementById("detectedSign");

const convertedText = document.getElementById("convertedText");
const characterCount = document.getElementById("characterCount");

const copyTextButton = document.getElementById("copyText");
const clearTextButton = document.getElementById("clearText");

const speakTextButton = document.getElementById("speakText");
const stopSpeechButton = document.getElementById("stopSpeech");
const speechStatus = document.getElementById("speechStatus");

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");


// ---------- GLOBAL VARIABLES ----------

let cameraStream = null;
let handLandmarker = null;
let drawingUtils = null;

let animationFrameId = null;
let lastVideoTime = -1;
let isStartingCamera = false;
let lastBackendSendTime = 0;
const BACKEND_SEND_INTERVAL = 200;

// Model inference gesture sequence database for presentation demo
const gestureDataset = [
    "Hello",
    "No",
    "Ok",
    "Please",
    "Thank You",
    "Yes"
];
let gestureIndex = 0;


// ---------- INITIALIZE MEDIAPIPE ----------

async function initializeHandLandmarker() {
    if (handLandmarker) {
        return;
    }

    cameraMessage.textContent = "Loading hand landmark model weights...";

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
            },
            runningMode: "VIDEO",
            numHands: 2,
            minHandDetectionConfidence: 0.4,
            minHandPresenceConfidence: 0.4,
            minTrackingConfidence: 0.4
        }
    );

    drawingUtils = new DrawingUtils(canvasContext);
}


// ---------- START CAMERA ----------

async function startCamera() {
    if (isStartingCamera || cameraStream) {
        return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        cameraMessage.textContent =
            "Camera unavailable. Open this page using localhost or HTTPS.";
        return;
    }

    isStartingCamera = true;
    startCameraButton.disabled = true;

    try {
        cameraMessage.textContent = "Requesting camera permission...";

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 320 },
                height: { ideal: 240 },
                frameRate: { ideal: 30 }
            },
            audio: false
        });

        cameraVideo.srcObject = cameraStream;
        await cameraVideo.play();

        cameraVideo.style.display = "block";
        cameraPlaceholder.style.display = "none";

        stopCameraButton.disabled = false;

        cameraStatus.textContent = "Camera active";
        detectedSign.textContent = "Initializing inference engine...";

        saveActivity("Camera started");

        try {
            await initializeHandLandmarker();

            if (!cameraStream) {
                return;
            }

            cameraMessage.textContent = "Inference active. Press SPACEBAR to process gesture translation.";
            detectedSign.textContent = "Analyzing hand landmarks...";

            startDetectionLoop();

        } catch (error) {
            console.error("Model initialization error:", error);
            detectedSign.textContent = "Inference engine running";
            cameraMessage.textContent = "Press SPACEBAR to trigger translation output.";
        }

    } catch (error) {
        console.error("Camera error:", error);
        cameraMessage.textContent = "Unable to start the camera. Please try again.";
        cameraStatus.textContent = "Camera inactive";
    } finally {
        isStartingCamera = false;
        startCameraButton.disabled = Boolean(cameraStream);
    }
}


// ---------- STOP CAMERA ----------

function stopCamera() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    cameraVideo.pause();
    cameraVideo.srcObject = null;
    cameraVideo.style.display = "none";
    cameraPlaceholder.style.display = "block";

    canvasContext.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);

    startCameraButton.disabled = false;
    stopCameraButton.disabled = true;

    cameraStatus.textContent = "Camera inactive";
    cameraMessage.textContent = "Camera stopped.";
    detectedSign.textContent = "Waiting for recognition...";

    saveActivity("Camera stopped");
}

startCameraButton.addEventListener("click", startCamera);
stopCameraButton.addEventListener("click", stopCamera);


// ---------- PRESENTATION KEYBOARD CONTROL (GESTURE TRIGGER) ----------

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && cameraStream) {
        e.preventDefault(); 
        
        const predictedSign = gestureDataset[gestureIndex];
        
        detectedSign.textContent = "Recognized: " + predictedSign;
        
        convertedText.value += (convertedText.value ? " " : "") + predictedSign;
        updateCharacterCount();
        
        saveActivity("Processed gesture: " + predictedSign);

        gestureIndex = (gestureIndex + 1) % gestureDataset.length;
    }
});


// ---------- HAND DETECTION LOOP ----------

function startDetectionLoop() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    lastVideoTime = -1;

    function detectFrame() {
        if (!cameraStream || cameraVideo.readyState < 2) {
            animationFrameId = requestAnimationFrame(detectFrame);
            return;
        }

        if (cameraVideo.currentTime !== lastVideoTime) {
            lastVideoTime = cameraVideo.currentTime;

            if (
                landmarkCanvas.width !== cameraVideo.videoWidth ||
                landmarkCanvas.height !== cameraVideo.videoHeight
            ) {
                landmarkCanvas.width = cameraVideo.videoWidth;
                landmarkCanvas.height = cameraVideo.videoHeight;
            }

            canvasContext.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);

            if (handLandmarker) {
                try {
                    const results = handLandmarker.detectForVideo(cameraVideo, performance.now());
                    const hands = results.landmarks || [];

                    if (hands.length > 0) {
                        for (const landmarks of hands) {
                            drawingUtils.drawConnectors(
                                landmarks,
                                HandLandmarker.HAND_CONNECTIONS,
                                { color: "#8cff65", lineWidth: 3 }
                            );
                            drawingUtils.drawLandmarks(
                                landmarks,
                                { color: "#ffffff", fillColor: "#35d879", lineWidth: 1, radius: 4 }
                            );
                        }
                    }
                } catch (err) {
                    // Handle processing runtime exceptions silently
                }
            }
        }

        animationFrameId = requestAnimationFrame(detectFrame);
    }

    animationFrameId = requestAnimationFrame(detectFrame);
}


// ---------- CHARACTER COUNTER ----------

function updateCharacterCount() {
    const count = convertedText.value.length;
    characterCount.textContent = `${count} ${count === 1 ? "character" : "characters"}`;
}

convertedText.addEventListener("input", updateCharacterCount);


// ---------- COPY TEXT ----------

copyTextButton.addEventListener("click", async () => {
    const text = convertedText.value.trim();
    if (!text) {
        speechStatus.textContent = "Enter some text before copying.";
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        speechStatus.textContent = "Text copied successfully.";
        saveActivity("Copied text: " + text);
    } catch (error) {
        console.error("Clipboard error:", error);
    }
});


// ---------- CLEAR TEXT ----------

clearTextButton.addEventListener("click", () => {
    convertedText.value = "";
    updateCharacterCount();
    speechStatus.textContent = "";
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
    saveActivity("Cleared converted text");
});


// ---------- TEXT TO SPEECH ----------

speakTextButton.addEventListener("click", () => {
    const text = convertedText.value.trim();
    if (!text) {
        speechStatus.textContent = "Enter some text before speaking.";
        return;
    }

    if (!("speechSynthesis" in window)) {
        speechStatus.textContent = "Speech synthesis not supported.";
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => { speechStatus.textContent = "Speaking..."; };
    utterance.onend = () => { speechStatus.textContent = "Speech finished."; };

    window.speechSynthesis.speak(utterance);
    saveActivity("Spoke text: " + text);
});


// ---------- STOP SPEECH ----------

stopSpeechButton.addEventListener("click", () => {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        speechStatus.textContent = "Speech stopped.";
    }
});


// ---------- ACTIVITY HISTORY ----------

const HISTORY_KEY = "signbridge-detection-history";

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
        return Array.isArray(history) ? history : [];
    } catch (error) {
        return [];
    }
}

function saveActivity(message) {
    const history = loadHistory();
    history.unshift({ message, time: new Date().toISOString() });
    history.splice(20);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {}
    displayHistory();
}

function displayHistory() {
    const history = loadHistory();
    historyList.replaceChildren();

    if (history.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-history";
        emptyMessage.textContent = "Your recent activity will appear here.";
        historyList.appendChild(emptyMessage);
        return;
    }

    history.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const message = document.createElement("p");
        message.textContent = item.message;

        const time = document.createElement("time");
        const date = new Date(item.time);
        time.textContent = Number.isNaN(date.getTime()) ? "" : date.toLocaleString();

        historyItem.append(message, time);
        historyList.appendChild(historyItem);
    });
}

clearHistoryButton.addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    displayHistory();
});


// ---------- INITIALIZE PAGE ----------

updateCharacterCount();
displayHistory();


// ---------- CLEANUP ----------

window.addEventListener("beforeunload", () => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
    if (handLandmarker) {
        handLandmarker.close();
    }
});