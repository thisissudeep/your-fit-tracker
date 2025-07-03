import React from 'react';
import styles from './WorkoutList.module.css';
import WorkoutCard from './WorkoutCard';


// WorkoutList component for displaying a list of workouts.
// It receives the 'workouts' array, and loading/error states for fetching
// from its parent (HomePage).
const WorkoutList = ({ workouts, listLoading, listError, onDelete }) => {
  if (listLoading) {
    return <p className={styles.loadingMessage}>Loading workouts...</p>;
  }

  if (listError) {
    return <p className={styles.errorMessage}>{listError}</p>;
  }

  if (workouts.length === 0) {
    return <p className={styles.noWorkoutsMessage}>No workouts found. Add some!</p>;
  }

  return (
    <section className={styles.workoutListSection}>
      <h2 className={styles.heading}>Your Workout History</h2>
      <ul className={styles.workoutListContainer}>
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout._id}
            workout={workout}
            onDelete={onDelete} // Pass onDelete prop to each card
          />
        ))}
      </ul>
    </section>
  );
};

export default WorkoutList;