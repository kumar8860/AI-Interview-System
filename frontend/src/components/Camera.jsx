import React, { useEffect, useRef, useState, memo } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const Camera = memo(({ onMetricsUpdate }) => {
  const videoRef = useRef(null);
  const [isAiReady, setIsAiReady] = useState(false);
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    let active = true;

    const setupAI = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });

        if (active) {
          landmarkerRef.current = landmarker;
          setIsAiReady(true);
          startWebcam();
        }
      } catch (error) { console.error("AI Init Error:", error); }
    };

    const startWebcam = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          requestRef.current = requestAnimationFrame(predict);
        };
      }
    };

    const predict = () => {
      if (!active || !videoRef.current || !landmarkerRef.current) return;
      if (videoRef.current.readyState === 4) {
        const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        
        if (results.faceLandmarks?.length > 0) {
          const landmarks = results.faceLandmarks[0];
          // Index 468 is the Left Iris. Center is roughly ~0.5 on the X axis.
          const irisX = landmarks[468].x;
          // If looking too far left or right, mark as wandering
          const isLookingAway = irisX < 0.44 || irisX > 0.56;
          
          onMetricsUpdate({
            eyeContact: isLookingAway ? "Wandering" : "Direct",
            contactColor: isLookingAway ? "#ef4444" : "#10b981"
          });
        }
      }
      requestRef.current = requestAnimationFrame(predict);
    };

    setupAI();
    return () => {
      active = false;
      cancelAnimationFrame(requestRef.current);
      if (landmarkerRef.current) landmarkerRef.current.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [onMetricsUpdate]); 

  return (
    <div style={styles.camContainer}>
      {!isAiReady && <div style={styles.loader}>SYNCING BIOMETRICS...</div>}
      <video ref={videoRef} style={{ ...styles.video, opacity: isAiReady ? 1 : 0 }} playsInline muted />
      <div style={styles.scanOverlay}></div>
    </div>
  );
});

const styles = {
  camContainer: { position: "relative", width: "100%", height: "100%", background: "#000", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(59, 130, 246, 0.3)", boxShadow: "0 0 30px rgba(0, 0, 0, 0.5)" },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", transition: "opacity 1s" },
  loader: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: "0.7rem", letterSpacing: "2px", zIndex: 5 },
  scanOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, #3b82f6, transparent)", animation: "scan 3s linear infinite", zIndex: 10 }
};

export default Camera;