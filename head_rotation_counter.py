import cv2
import mediapipe as mp
import numpy as np
import os

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

video_path = r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\videos\Floor seated head rotations.mkv"
cap = cv2.VideoCapture(0)
output_folder = r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\output"
os.makedirs(output_folder, exist_ok=True)

count = 0
rotation_stage = "front"
rotation_angle_threshold = 80


def calculate_angle(point1, point2, point3):
    a = np.array(point1)
    b = np.array(point2)
    c = np.array(point3)
    ab = b - a
    ac = c - a
    cosine_angle = np.dot(ab, ac) / (np.linalg.norm(ab) * np.linalg.norm(ac))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)


def write_count_to_file(count):
    output_file_path = os.path.join(output_folder, "head_rotation_count.txt")
    with open(output_file_path, "a") as file:
        file.write(f"Head Rotation Count: {count}\n")


with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    cv2.namedWindow("Head Rotation Detection", cv2.WINDOW_NORMAL)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        if results.pose_landmarks is not None:
            landmarks = results.pose_landmarks.landmark
            nose = [
                landmarks[mp_pose.PoseLandmark.NOSE.value].x,
                landmarks[mp_pose.PoseLandmark.NOSE.value].y,
            ]
            left_ear = [
                landmarks[mp_pose.PoseLandmark.LEFT_EAR.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_EAR.value].y,
            ]
            right_ear = [
                landmarks[mp_pose.PoseLandmark.RIGHT_EAR.value].x,
                landmarks[mp_pose.PoseLandmark.RIGHT_EAR.value].y,
            ]
            angle = calculate_angle(nose, left_ear, right_ear)

            if angle < rotation_angle_threshold:
                if rotation_stage == "front":
                    rotation_stage = "turned"
            else:
                if rotation_stage == "turned":
                    count += 1
                    write_count_to_file(count)
                    rotation_stage = "front"

        cv2.putText(
            image,
            f"Head Rotations: {count}",
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

        cv2.imshow("Head Rotation Detection", image)

        if cv2.waitKey(10) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()
