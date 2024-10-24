import cv2
import mediapipe as mp
import numpy as np
import os
import firebase_admin
from firebase_admin import credentials, firestore

 
cred = credentials.Certificate('your-fit-tracker/serviceAccountKey.json')
firebase_admin.initialize_app(cred)

 
db = firestore.client()

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

CONFIDENCE_THRESHOLD = 0.8


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


video_path = (
    r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\videos\pushup video.mp4"
)
output_folder = r"output"
os.makedirs(output_folder, exist_ok=True)


def write_count_to_firestore(count):
   
    doc_ref = db.collection('PushUp').document()
    doc_ref.set({'pushups_count': count}, merge=True)
    print(f"Push-ups count {count} saved to Firestore")


cap = cv2.VideoCapture(0)
count = 0
stage = None
consecutive_frames = 0

try:
    with mp_pose.Pose(
        min_detection_confidence=0.5, min_tracking_confidence=0.5
    ) as pose:
        cv2.namedWindow("Push-up Detection", cv2.WINDOW_NORMAL)
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
                left_shoulder = [
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y,
                ]
                right_shoulder = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y,
                ]
                left_elbow = [
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y,
                ]
                right_elbow = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y,
                ]
                left_wrist = [
                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y,
                ]
                right_wrist = [
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y,
                ]

                left_elbow_angle = calculate_angle(
                    left_shoulder, left_elbow, left_wrist
                )
                right_elbow_angle = calculate_angle(
                    right_shoulder, right_elbow, right_wrist
                )

                if left_elbow_angle < 90 and right_elbow_angle < 90:
                    stage = "down"
                if (
                    left_elbow_angle > 160
                    and right_elbow_angle > 160
                    and stage == "down"
                ):
                    consecutive_frames += 1
                    if consecutive_frames > 5:
                        stage = "up"
                        count += 1
                        print(f"Push-ups: {count}")  
                        write_count_to_firestore(count)  
                        consecutive_frames = 0
                else:
                    consecutive_frames = 0

            except Exception as e:
                print(f"Error processing landmarks: {e}")
                pass

            cv2.putText(
                image,
                "Push-ups: " + str(count),
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
            cv2.imshow("Push-up Detection", image)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

except KeyboardInterrupt:
    print("Program interrupted by user.")

finally:
    cap.release()
    cv2.destroyAllWindows() 
