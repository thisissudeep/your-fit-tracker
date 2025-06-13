"use client";
// Import necessary MediaPipe components
// DrawingUtils and PoseLandmarker.POSE_CONNECTIONS are used for drawing on canvas
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import * as drawingUtilsModule from "@mediapipe/drawing_utils"; // Import as namespace for DrawingUtils and POSE_CONNECTIONS
import React, { useEffect, useRef, useState, useCallback } from "react";

// Defensively resolve DrawingUtils and POSE_CONNECTIONS from the imported module
const DrawingUtils =
  drawingUtilsModule.DrawingUtils || drawingUtilsModule.default?.DrawingUtils;
const POSE_CONNECTIONS =
  drawingUtilsModule.POSE_CONNECTIONS ||
  drawingUtilsModule.default?.POSE_CONNECTIONS;

// Fail-safe checks for drawing utilities (will log errors if not found)
if (!DrawingUtils) {
  console.error(
    "CRITICAL ERROR: DrawingUtils could not be resolved from @mediapipe/drawing_utils. Check package and imports."
  );
}
if (!POSE_CONNECTIONS) {
  console.error(
    "CRITICAL ERROR: POSE_CONNECTIONS could not be resolved from @mediapipe/drawing_utils. Check package and imports."
  );
}

// Helper function to calculate angle between three points
// This function calculates the angle in degrees between three points (a, b, c) where b is the vertex.
const calculateAngle = (a, b, c) => {
  const ab = [a[0] - b[0], a[1] - b[1]];
  const cb = [c[0] - b[0], c[1] - b[1]];
  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const magAB = Math.hypot(ab[0], ab[1]);
  const magCB = Math.hypot(cb[0], cb[1]);
  const cosineAngle = dot / (magAB * magCB);
  let angle =
    Math.acos(Math.min(Math.max(cosineAngle, -1), 1)) * (180 / Math.PI);
  return angle;
};

// SquatDetection component
// This component now accepts 'isActive' to control its operation
// and 'onDetectionUpdate' to report status and counts back to its parent.
export default function SquatDetection({
  isActive,
  onDetectionUpdate = () => {},
}) {
  // Changed from Home to SquatDetection
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // Canvas ref is retained
  const lastVideoTimeRef = useRef(-1);
  const animationFrameIdRef = useRef(null); // Renamed from requestRef for consistency

  // State refs for exercise counting logic (persists across renders)
  const squatCountRef = useRef(0); // Renamed from squatCount for consistency
  const stageRef = useRef(null); // Tracks the current stage of the exercise ("up", "down", or null)
  const consecutiveFramesRef = useRef(0); // Counts consecutive frames in a certain stage for stability
  const isCameraPlayingRef = useRef(false); // Tracks if the camera stream is actively playing

  // Main rendering and detection loop
  // This function is responsible for continuously processing video frames for pose detection
  // and drawing landmarks/text on the canvas.
  const renderLoop = useCallback(() => {
    // Check if essential components are ready before proceeding
    // videoRef.current and canvasRef.current are now always in the DOM due to JSX change
    if (
      !poseLandmarker ||
      !videoRef.current ||
      !canvasRef.current ||
      videoRef.current.readyState < 2 ||
      !isCameraPlayingRef.current
    ) {
      animationFrameIdRef.current = requestAnimationFrame(renderLoop); // Request next frame if not ready
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ensure canvas context is available
    if (!ctx) {
      console.error("Canvas 2D context not found.");
      onDetectionUpdate({
        reps: squatCountRef.current,
        stage: stageRef.current,
        status: "Canvas error.",
      });
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    // Only process a new video frame if the currentTime has changed
    if (video.currentTime !== lastVideoTimeRef.current) {
      // Set canvas dimensions to match the video stream's actual resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save(); // Save the current state of the canvas context

      // Apply horizontal flip to the canvas context to mirror the video for a "selfie" view
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      // Draw the current video frame onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Perform pose detection on the current video frame
      const results = poseLandmarker.detectForVideo(video, performance.now());

      // If landmarks are detected
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0]; // Get landmarks for the first detected person

        // Draw landmarks and connectors on the canvas using DrawingUtils
        if (DrawingUtils && POSE_CONNECTIONS) {
          // You had DrawingUtils.lerp for radius, ensure it's used correctly if desired.
          DrawingUtils.drawLandmarks(ctx, landmarks, {
            radius: (data) =>
              DrawingUtils.lerp
                ? DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
                : 5, // Added check for lerp
            color: "#FF0000", // Red color for landmarks
            lineWidth: 2,
          });
          DrawingUtils.drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
            color: "#00FF00", // Green color for connectors
            lineWidth: 4,
          });
        }

        // Restore canvas context to original (un-mirrored) state before drawing text
        ctx.restore();
        ctx.save(); // Save again for drawing text

        // Helper to get landmark coordinates (normalized [0,1]) and convert to canvas pixels
        const getPoint = (i) => [
          landmarks[i].x * canvas.width,
          landmarks[i].y * canvas.height,
        ];

        // Check if required landmarks for squat detection are present (hips, knees, ankles)
        if (
          landmarks[23] &&
          landmarks[25] &&
          landmarks[27] && // Left hip, knee, ankle
          landmarks[24] &&
          landmarks[26] &&
          landmarks[28] // Right hip, knee, ankle
        ) {
          const leftKneeAngle = calculateAngle(
            getPoint(23),
            getPoint(25),
            getPoint(27)
          ); // Calculate left knee angle
          const rightKneeAngle = calculateAngle(
            getPoint(24),
            getPoint(26),
            getPoint(28)
          ); // Calculate right knee angle

          // Squat Counting Logic (adapted from your provided code)
          // Stage 'up' (standing position)
          if (leftKneeAngle > 160 && rightKneeAngle > 160) {
            stageRef.current = "up";
          }
          // Stage 'down' (squatted position) and count rep
          if (
            leftKneeAngle < 90 &&
            rightKneeAngle < 90 &&
            stageRef.current === "up"
          ) {
            consecutiveFramesRef.current++;
            if (consecutiveFramesRef.current > 3) {
              // Use a small frame buffer for stability
              squatCountRef.current++; // Increment squat count
              stageRef.current = "down"; // Set stage to down
              consecutiveFramesRef.current = 0; // Reset frames
              console.log("Squat Count:", squatCountRef.current);
            }
          } else if (
            stageRef.current === "down" &&
            (leftKneeAngle > 90 || rightKneeAngle > 90)
          ) {
            // Reset frames if moving out of "down" without completing "up"
            consecutiveFramesRef.current = 0;
          }

          // Report detection data back to the parent component
          onDetectionUpdate({
            reps: squatCountRef.current,
            stage: stageRef.current,
            leftKneeAngle: leftKneeAngle,
            rightKneeAngle: rightKneeAngle,
            status: "Detecting squats...",
          });

          // Draw count and angles directly on the canvas (text is NOT mirrored)
          ctx.font = "bold 30px Arial"; // Larger, bold font for rep count
          ctx.fillStyle = "lime"; // Text color
          ctx.fillText(`Squats: ${squatCountRef.current}`, 20, 50); // Position at top-left
          ctx.font = "20px Arial"; // Smaller font for angles
          ctx.fillText(`L-Knee: ${leftKneeAngle.toFixed(0)}°`, 20, 80);
          ctx.fillText(`R-Knee: ${rightKneeAngle.toFixed(0)}°`, 20, 105);
        } else {
          // Landmarks are present, but not sufficient for current exercise detection (e.g., body parts out of frame)
          onDetectionUpdate({
            reps: squatCountRef.current,
            stage: null,
            status: "Adjust body for squat detection",
          });
        }
      } else {
        // No landmarks detected, clear the canvas and update status
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDetectionUpdate({
          reps: squatCountRef.current,
          stage: null,
          status: "No person detected",
        });
      }
      ctx.restore(); // Restore final canvas context state
      lastVideoTimeRef.current = video.currentTime; // Update last processed video time
    }
    animationFrameIdRef.current = requestAnimationFrame(renderLoop); // Request the next animation frame
  }, [poseLandmarker, onDetectionUpdate]); // renderLoop dependencies

  // Effect to initialize MediaPipe PoseLandmarker model (runs only once on component mount)
  useEffect(() => {
    const initializeLandmarker = async () => {
      try {
        console.log("SquatDetection: Initializing PoseLandmarker model...");
        // Define the path to the MediaPipe Tasks WASM assets
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        // Create the PoseLandmarker instance with specified options
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task", // Path to the pose landmarker model
          },
          runningMode: "VIDEO", // Set mode for video input
          numPoses: 1, // Detect one person
        });
        setPoseLandmarker(landmarker); // Store the initialized landmarker in state
        console.log("SquatDetection: PoseLandmarker model initialized.");
      } catch (error) {
        console.error(
          "SquatDetection: Error initializing PoseLandmarker model:",
          error
        );
        onDetectionUpdate({
          reps: 0,
          stage: null,
          status: "Model failed to load. Check console for details.",
        });
      }
    };

    initializeLandmarker(); // Call the initialization function

    // Cleanup function for this effect: closes the landmarker when component unmounts or effect re-runs
    return () => {
      console.log("SquatDetection: Model initialization cleanup running.");
      if (poseLandmarker) {
        // Only close if the landmarker was actually set
        poseLandmarker.close();
        setPoseLandmarker(null); // Reset state
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect to manage camera stream and start/stop the detection loop based on 'isActive' prop
  useEffect(() => {
    const currentVideo = videoRef.current; // Capture current ref values for cleanup
    const currentLandmarker = poseLandmarker;

    // Helper function to stop the camera stream and detection loop
    const stopCameraAndLoop = () => {
      console.log("SquatDetection: Stopping camera and detection loop...");
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (currentVideo && currentVideo.srcObject) {
        currentVideo.srcObject.getTracks().forEach((track) => track.stop()); // Stop all camera tracks
        currentVideo.srcObject = null; // Clear video source
        isCameraPlayingRef.current = false; // Update camera status ref
      }
      // Reset counting states when *explicitly* stopping via isActive=false
      squatCountRef.current = 0;
      stageRef.current = null;
      consecutiveFramesRef.current = 0; // Reset consecutive frames
      onDetectionUpdate({ reps: 0, stage: null, status: "Inactive" }); // Report inactive status
    };

    // Logic to start camera and detection loop if isActive is true and landmarker is ready
    if (isActive && currentLandmarker) {
      // Only attempt to start if camera is not already playing to prevent redundant calls
      if (!isCameraPlayingRef.current) {
        console.log(
          "SquatDetection: isActive is true and PoseLandmarker is ready. Attempting to start camera..."
        );
        onDetectionUpdate({
          reps: 0,
          stage: null,
          status: "Requesting camera access...",
        });

        const startCamera = async () => {
          try {
            console.log(
              "SquatDetection: Calling navigator.mediaDevices.getUserMedia..."
            );
            // Request camera access with ideal high resolution for better detection quality
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            });
            console.log("SquatDetection: Camera stream obtained.");

            if (currentVideo) {
              currentVideo.srcObject = stream; // Set video source to camera stream
              // Set onloadedmetadata handler only if it hasn't been set to prevent re-assignment issues
              if (!currentVideo.onloadedmetadata) {
                currentVideo.onloadedmetadata = () => {
                  console.log(
                    "SquatDetection: Video metadata loaded. Playing video."
                  );
                  currentVideo.play(); // Start video playback
                  isCameraPlayingRef.current = true; // Set camera status to playing
                  console.log(
                    "SquatDetection: Camera stream acquired and playing."
                  );
                  onDetectionUpdate({
                    reps: 0,
                    stage: null,
                    status: "Detecting poses...",
                  });
                  animationFrameIdRef.current =
                    requestAnimationFrame(renderLoop); // Start the detection loop
                };
              } else {
                // If handler was already set (e.g., video re-used), just play and start loop
                currentVideo.play();
                isCameraPlayingRef.current = true;
                onDetectionUpdate({
                  reps: 0,
                  stage: null,
                  status: "Detecting poses...",
                });
                animationFrameIdRef.current = requestAnimationFrame(renderLoop);
              }
            } else {
              console.warn(
                "SquatDetection: videoRef.current was null when trying to set srcObject. This might indicate a rendering issue."
              );
              onDetectionUpdate({
                reps: 0,
                stage: null,
                status: "Internal error: Video element not ready.",
              });
            }
          } catch (error) {
            console.error("SquatDetection: Error starting camera:", error);
            // Provide user-friendly error messages based on common getUserMedia errors
            if (error.name === "NotAllowedError") {
              onDetectionUpdate({
                reps: 0,
                stage: null,
                status: "Camera access denied. Please grant permission.",
              });
            } else if (error.name === "NotFoundError") {
              onDetectionUpdate({
                reps: 0,
                stage: null,
                status: "No camera found. Please ensure a camera is connected.",
              });
            } else if (error.name === "NotReadableError") {
              onDetectionUpdate({
                reps: 0,
                stage: null,
                status: "Camera is already in use or inaccessible.",
              });
            } else {
              onDetectionUpdate({
                reps: 0,
                stage: null,
                status: `Camera error: ${error.message}`,
              });
            }
            isCameraPlayingRef.current = false; // Ensure ref is false on error
          }
        };
        startCamera(); // Initiate camera start
      } else {
        // Camera is already playing, just update status for consistency
        console.log(
          "SquatDetection: Camera already active, awaiting detection loop."
        );
        onDetectionUpdate({
          reps: squatCountRef.current,
          stage: stageRef.current,
          status: "Detecting poses...",
        });
      }
    } else if (!isActive) {
      // If isActive is false, ensure camera and loop are stopped
      stopCameraAndLoop();
    }

    // Cleanup function for this effect: ensures resources are released when component unmounts or 'isActive' changes to false
    return () => {
      console.log(
        "SquatDetection: Main camera/detection effect cleanup running."
      );
      stopCameraAndLoop(); // Call the stop function directly for cleanup
    };
  }, [isActive, poseLandmarker, renderLoop, onDetectionUpdate]); // Dependencies for this useEffect

  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Display messages based on component state */}
      {!isActive && (
        <p style={{ color: "var(--text-color)" }}>
          Select an exercise and click "Start AI Counter" to begin.
        </p>
      )}
      {isActive && !poseLandmarker && (
        <p style={{ color: "var(--text-color)" }}>
          Loading Squat Detection Model...
        </p>
      )}
      {isActive &&
        poseLandmarker &&
        !isCameraPlayingRef.current && ( // Simplified condition here
          <p style={{ color: "var(--text-color)" }}>
            Waiting for camera access...
            <br />
            <button
              onClick={() => {
                console.log(
                  "Manual retry attempted. Check browser's address bar for camera icon/permissions and refresh if needed."
                );
                onDetectionUpdate({
                  reps: 0,
                  stage: null,
                  status: "Retrying camera access... (Manual)",
                });
              }}
              style={{
                marginTop: "10px",
                padding: "8px 15px",
                borderRadius: "5px",
                border: "1px solid var(--button-border-color)", // Use themed border
                backgroundColor: "var(--button-bg-color)", // Use themed background
                color: "white",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Retry Camera
            </button>
          </p>
        )}

      {/* Main container for video and canvas */}
      {/* Moved outside conditional render to ensure videoRef.current is always available */}
      <div
        style={{
          position: "relative",
          width: "100%", // Take 100% of parent width
          height: "100%", // Take 100% of parent height
          margin: "0 auto", // Center horizontally
          border: "1px solid #ccc",
          overflow: "hidden",
          backgroundColor: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // Conditionally hide if not active, but keep in DOM
          opacity: isActive && poseLandmarker ? 1 : 0,
          pointerEvents: isActive && poseLandmarker ? "auto" : "none",
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <video
          ref={videoRef}
          // Remove fixed width/height attributes from JSX, rely on CSS
          style={{
            width: "100%", // Make video fill container
            height: "100%", // Make video fill container
            objectFit: "contain", // Fit video within boundaries without cropping, preserving aspect ratio
            transform: "scaleX(-1)", // ONLY apply flip to video for selfie mode
          }}
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          // Remove fixed width/height attributes from JSX, rely on CSS
          style={{
            position: "absolute", // Position absolutely within the flex container
            top: 0,
            left: 0,
            width: "100%", // Make canvas fill container
            height: "100%", // Make canvas fill container
            // NO transform: "scaleX(-1)" here, mirroring is done in canvas context
          }}
        />
      </div>
    </div>
  );
}
