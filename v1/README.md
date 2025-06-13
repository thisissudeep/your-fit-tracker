# AI-Based Exercise Detection and Counting

This project uses computer vision and deep learning techniques to detect and count various exercises (squats, push-ups, head rotations, and more) in real-time using a webcam. It leverages **MediaPipe Pose** for human pose detection and **OpenCV** for video processing. Additionally, the exercise counts are stored in a **Firebase Firestore** database for tracking progress over time.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Exercises Implemented](#exercises-implemented)
- [Contributors](#contributors)


## Features

- Real-time detection and counting of exercises like squats, push-ups, and head rotations.
- Break timer functionality to remind the user to take a break between exercises.
- Exercise counts are automatically stored in Firebase Firestore, categorized by date and time.
- Support for adding more exercises with customizable pose-based detection.
  
## Technologies

This project is built using:

- Python 3.8+
- OpenCV
- MediaPipe Pose
- Firebase Admin SDK
- NumPy

## Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/thisissudeep/exercise-detection.git
    cd exercise-detection
    ```

2. **Install the required libraries**:
    You can install the required Python libraries using `pip`:
    ```bash
    pip install opencv-python mediapipe firebase-admin numpy
    ```

3. **Set up Firebase**:
    Make sure you set up Firebase for the project and download the `serviceAccountKey.json` file (instructions below).

4. **Run the Program**:
    Start detecting exercises using your webcam:
    ```bash
    python main.py
    ```

## Firebase Setup

This project uses Firebase Firestore to store exercise counts.

### Steps:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable Firestore in the project.
3. Generate a service account key:
    - Go to **Project Settings > Service accounts**.
    - Click **Generate new private key**.
    - Download the `serviceAccountKey.json` file and place it in the root directory of the project.
4. Ensure that Firestore read and write permissions are enabled for your project.

## Exercises Implemented

1. **Squats Detection**:
    - Detects and counts squats based on knee angle.
2. **Push-ups Detection**:
    - Detects and counts push-ups based on elbow angle.
3. **Head Rotations Detection**:
    - Detects and counts head rotations based on the angle between the nose and ears.
4. **Jumps Detection**:
    - Detects and counts jumps based on the vertical position of the body.
5. **Alternate Toe Touch Detection**:
    - Detects and counts alternate toe touches based on the position of the hands in relation to the feet.
6. **Break Timer**:
    - Displays a break timer image, reminding the user to take breaks between exercises.

## Contributors

- [Monishwaran K](https://github.com/monishwarank) - Firebase Integration
- [Sudeep B](https://github.com/thisissudeep) - AI Development

If you'd like to contribute to this project, feel free to open a pull request with your improvements. Bug reports and feature requests are welcome as well via the [issues page](https://github.com/thisissudeep/exercise-detection/issues).

