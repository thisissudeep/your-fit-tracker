import cv2
import numpy as np
import mediapipe as mp
import os

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

jumping_jack_count = 0
in_jumping_jack = False
hand_threshold = 0.2

video_path = (
    r"C:\Users\HP\Documents\Python Scripts\Your Fit Tracker\videos\Jumping Jacks.mkv"
)
cap = cv2.VideoCapture(0)

output_folder = r"output"
os.makedirs(output_folder, exist_ok=True)


def write_count_to_file(count):
    output_file_path = os.path.join(output_folder, "jumping_jack_count.txt")
    with open(output_file_path, "a") as file:
        file.write(f"Jumping Jacks Count: {count}\n")


with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    cv2.namedWindow("Mediapipe Feed", cv2.WINDOW_NORMAL)
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

            try:
                left_wrist_y = landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y
                right_wrist_y = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST].y
                head_y = landmarks[mp_pose.PoseLandmark.NOSE].y

                if left_wrist_y < head_y and right_wrist_y < head_y:
                    if not in_jumping_jack:
                        in_jumping_jack = True
                        jumping_jack_count += 1
                        write_count_to_file(jumping_jack_count)
                else:
                    in_jumping_jack = False

            except AttributeError:
                pass

            cv2.putText(
                image,
                f"Jumping Jacks: {jumping_jack_count}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2,
                cv2.LINE_AA,
            )

        mp_drawing.draw_landmarks(
            image,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
        )

        cv2.imshow("Mediapipe Feed", image)

        if cv2.waitKey(10) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()
