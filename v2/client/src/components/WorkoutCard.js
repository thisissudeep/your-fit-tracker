import React from 'react';
import styles from './WorkoutCard.module.css'; // Import CSS Module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // For the trash icon
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Import the trash icon

// WorkoutCard component for displaying a single workout item's details.

const WorkoutCard = ({ workout, onDelete }) => {
  return (
    <li className={styles.workoutCard}>
      <h2 className={styles.exerciseNameHeading}>{workout.exerciseName}</h2>
      <p className={styles.workoutDetails}>
        Sets: <span className={styles.workoutValue}>{workout.sets}</span> <br />
        Reps: <span className={styles.workoutValue}>{workout.reps}</span> <br />
        <span className={styles.timestamp}>
          Added: {new Date(workout.createdAt).toLocaleDateString()} {new Date(workout.createdAt).toLocaleTimeString()}
        </span>
      </p>

      {/*Call onDelete with workout._id */}
      <button
        className={styles.deleteButton}
        aria-label="Delete Workout"
        onClick={() => onDelete(workout._id)}
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
    </li>
  );
};

export default WorkoutCard;