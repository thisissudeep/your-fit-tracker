import cv2
import mediapipe as mp
import numpy as np
import os

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def calculate_distance(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.linalg.norm(a - b)


def write_count_to_file(count):
    output_file_path = os.path.join(output_folder, "toe_touches_count.txt")
    with open(output_file_path, "a") as f:
        f.write(f"Toe Touches: {count}\n")


video_path = r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\videos\alternate toe touch video.mkv"
output_folder = r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\output"
os.makedirs(output_folder, exist_ok=True)

cap = cv2.VideoCapture(0)
count = 0
stage = None

with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    cv2.namedWindow("Toe Touch Detection", cv2.WINDOW_NORMAL)
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
            left_hand = [
                landmarks[mp_pose.PoseLandmark.LEFT_INDEX.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_INDEX.value].y,
            ]
            right_foot = [
                landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y,
            ]
            right_hand = [
                landmarks[mp_pose.PoseLandmark.RIGHT_INDEX.value].x,
                landmarks[mp_pose.PoseLandmark.RIGHT_INDEX.value].y,
            ]
            left_foot = [
                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y,
            ]

            distance_left_hand_right_foot = calculate_distance(left_hand, right_foot)
            distance_right_hand_left_foot = calculate_distance(right_hand, left_foot)

            if distance_left_hand_right_foot < 0.1:
                if stage != "left_hand_right_foot":
                    count += 1
                    write_count_to_file(count)
                    stage = "left_hand_right_foot"

            if distance_right_hand_left_foot < 0.1:
                if stage != "right_hand_left_foot":
                    count += 1
                    write_count_to_file(count)
                    stage = "right_hand_left_foot"

        except Exception as e:
            pass

        cv2.putText(
            image,
            f"Toe Touches: {count}",
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

        cv2.imshow("Toe Touch Detection", image)

        if cv2.waitKey(10) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()
