import cv2
import mediapipe as mp
import numpy as np
import os
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime


cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def write_count_to_firestore(user_id, exercise_counts):
    doc_ref = (
        db.collection("users")
        .document(user_id)
        .collection("daily_records")
        .document(datetime.now().strftime("%Y-%m-%d"))
        .collection("time_records")
        .document(datetime.now().strftime("%H:%M:%S"))
    )
    doc_ref.set(exercise_counts, merge=True)


def detect_squats(cap):
    count = 0
    stage = None
    consecutive_frames = 0

    cv2.namedWindow("Squat Detection", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Squat Detection", 800, 600)

    try:
        with mp_pose.Pose(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        ) as pose:
            while count < 10:
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
                    right_knee_angle = calculate_angle(
                        right_hip, right_knee, right_ankle
                    )

                    if left_knee_angle > 160 and right_knee_angle > 160:
                        stage = "up"
                    if (
                        left_knee_angle < 135
                        and right_knee_angle < 135
                        and stage == "up"
                    ):
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

    except KeyboardInterrupt:
        print("Squat detection stopped by user.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        return count


def detect_pushups(cap):
    count = 0
    stage = None
    consecutive_frames = 0

    try:
        with mp_pose.Pose(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        ) as pose:
            cv2.namedWindow("Push-up Detection", cv2.WINDOW_NORMAL)
            while count < 10:
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
        print("Pushups detection stopped by user.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        return count


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


def detect_head_rotation(cap):
    count = 0
    rotation_stage = "front"
    rotation_angle_threshold = 80

    try:
        with mp_pose.Pose(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        ) as pose:
            cv2.namedWindow("Head Rotation Detection", cv2.WINDOW_NORMAL)

            while count < 10:
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

                    a = np.array(nose)
                    b = np.array(left_ear)
                    c = np.array(right_ear)
                    ab = b - a
                    ac = c - a
                    cosine_angle = np.dot(ab, ac) / (
                        np.linalg.norm(ab) * np.linalg.norm(ac)
                    )
                    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
                    angle = np.degrees(angle)

                    if angle < rotation_angle_threshold:
                        if rotation_stage == "front":
                            rotation_stage = "turned"
                    else:
                        if rotation_stage == "turned":
                            count += 1
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

    except KeyboardInterrupt:
        print("Head rotation detection stopped by user.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        return count


def detect_jumps(cap):

    jumping_jack_count = 0
    in_jumping_jack = False
    hand_threshold = 0.2
    try:
        with mp_pose.Pose(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        ) as pose:
            cv2.namedWindow("Jump Counter", cv2.WINDOW_NORMAL)

            while cap.isOpened() and jumping_jack_count < 10:
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
                    mp_drawing.DrawingSpec(
                        color=(245, 117, 66), thickness=2, circle_radius=2
                    ),
                    mp_drawing.DrawingSpec(
                        color=(245, 66, 230), thickness=2, circle_radius=2
                    ),
                )

                cv2.imshow("Jump Counter", image)

                if cv2.waitKey(10) & 0xFF == ord("q"):
                    break

    except KeyboardInterrupt:
        print("Jumping Jacks detection stopped by user.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        return jumping_jack_count


def detect_alternate_toe_touch(cap):

    count = 0
    stage = None

    try:
        with mp_pose.Pose(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        ) as pose:
            cv2.namedWindow("Toe Touch Detection", cv2.WINDOW_NORMAL)
            while count < 10:
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

                    distance_left_hand_right_foot = np.linalg.norm(
                        np.array(left_hand) - np.array(right_foot)
                    )
                    distance_right_hand_left_foot = np.linalg.norm(
                        np.array(right_hand) - np.array(left_foot)
                    )

                    if distance_left_hand_right_foot < 0.1:
                        if stage != "left_hand_right_foot":
                            count += 1

                            stage = "left_hand_right_foot"

                    if distance_right_hand_left_foot < 0.1:
                        if stage != "right_hand_left_foot":
                            count += 1
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

    except KeyboardInterrupt:
        print("Toe Touch detection stopped by user.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        return count


def main():

    exercise_data = {}

    try:
        while True:
            print("Choose an exercise to detect:")
            print("1. Squats")
            print("2. Push-ups")
            print("3. Head Rotation")
            print("4. Jumping Jacks")
            print("5. Alternate Toe Touch")
            print("6. Exit")

            choice = input("Enter your choice (1-6): ")

            if choice == "1":
                cap = cv2.VideoCapture(0)
                exercise_data["squats"] = detect_squats(cap)

            elif choice == "2":
                cap = cv2.VideoCapture(0)
                exercise_data["pushups"] = detect_pushups(cap)

            elif choice == "3":
                cap = cv2.VideoCapture(0)
                exercise_data["head_rotation"] = detect_head_rotation(cap)

            elif choice == "4":
                cap = cv2.VideoCapture(0)
                exercise_data["jumping jacks"] = detect_jumps(cap)

            elif choice == "5":
                cap = cv2.VideoCapture(0)
                exercise_data["alternate_toe_touches"] = detect_alternate_toe_touch(cap)

            elif choice == "6":
                break

            else:
                print("Invalid choice, please try again.")

    finally:
        write_count_to_firestore("Monishwaran", exercise_data)


if __name__ == "__main__":
    main()
