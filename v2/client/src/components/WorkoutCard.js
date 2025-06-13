import React from 'react';
import styles from './WorkoutCard.module.css'; // Import CSS Module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // For the trash icon
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Import the trash icon

// WorkoutCard component for displaying a single workout item's details.
const WorkoutCard = ({ workout }) => {
  return (
    <li className={styles.workoutCard}>
      {/* Exercise Name as the main heading - unbolded via CSS */}
      <h2 className={styles.exerciseNameHeading} >{workout.exerciseName}</h2>
      
      {/* Workout details: Sets, Reps, and Timestamp */}
      <p className={styles.workoutDetails}>
        {/* <<< CRITICAL CHANGE: Removed <strong> tags from "Sets:" and "Reps:" labels */}
        Sets  : <span className={styles.workoutValue}>{workout.sets}</span> <br />
        Reps : <span className={styles.workoutValue}>{workout.reps}</span> <br />
        <span className={styles.timestamp}>
          Added: {new Date(workout.createdAt).toLocaleDateString()} {new Date(workout.createdAt).toLocaleTimeString()}
        </span>
      </p>

      {/* Delete button (UI only for now) */}
      <button className={styles.deleteButton} aria-label="Delete Workout">
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
    </li>
  );
};

export default WorkoutCard;