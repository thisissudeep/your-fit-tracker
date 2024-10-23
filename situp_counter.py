import cv2
import mediapipe as mp
import numpy as np
import os

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
        a[1] - b[1], a[0] - b[0]
    )
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle


output_folder = r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\output"
os.makedirs(output_folder, exist_ok=True)


def export_count_to_file(count):
    output_file_path = os.path.join(output_folder, "squat_count.txt")
    with open(output_file_path, "a") as f:
        f.write(f"Squats: {count}\n")


video_path = (
    r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\videos\situp video.mkv"
)
cap = cv2.VideoCapture(video_path)
print(f"Video capture opened: {cap.isOpened()}")
count = 0
stage = None
consecutive_frames = 0

cv2.namedWindow("Squat Detection", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Squat Detection", 800, 600)

try:

    with mp_pose.Pose(
        min_detection_confidence=0.5, min_tracking_confidence=0.5
    ) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            try:
                landmarks = results.pose_landmarks.landmark
                left_hip = [
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y,
                ]
                left_knee = [
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y,
                ]
                left_ankle = [
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y,
                ]
                right_hip = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y,
                ]
                right_knee = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y,
                ]
                right_ankle = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y,
                ]

                left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
                right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)

                if left_knee_angle > 160 and right_knee_angle > 160:
                    stage = "up"
                if left_knee_angle < 135 and right_knee_angle < 135 and stage == "up":
                    consecutive_frames += 1
                    if consecutive_frames > 5:
                        stage = "down"
                        count += 1
                        print(f"Squats: {count}")
                        consecutive_frames = 0
                else:
                    consecutive_frames = 0

            except Exception as e:
                pass

            cv2.putText(
                image,
                f"Squats: {count}",
                (10, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2,
                cv2.LINE_AA,
            )
            mp_drawing.draw_landmarks(
                image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS
            )
            cv2.imshow("Squat Detection", image)

            if cv2.waitKey(10) & 0xFF == ord("q"):
                break
finally:
    export_count_to_file(count)
    cap.release()
    cv2.destroyAllWindows()
