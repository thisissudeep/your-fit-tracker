import React from 'react';
import WorkoutCard from './WorkoutCard'; // Import the WorkoutCard component
import styles from './WorkoutList.module.css'; // Import CSS Module for local styling

// WorkoutList component for displaying a list of workouts.
// It receives the 'workouts' array, and loading/error states for fetching
// from its parent (HomePage).
const WorkoutList = ({ workouts, listLoading, listError }) => {
  return (
    <section className={styles.workoutListSection}>
      <h2 className={styles.heading}>All Workouts</h2>

      {/* Conditional rendering for loading, error, and empty states */}
      {listLoading && <p className={styles.loadingMessage}>Loading workouts...</p>}
      {listError && !listLoading && <p className={styles.errorMessage}>{listError}</p>}
      
      {!listLoading && !listError && workouts.length === 0 && (
        <p className={styles.noWorkoutsMessage}>No workouts found. Add one above!</p>
      )}

      {/* Use an unordered list to simply contain the cards */}
      <ul className={styles.workoutListContainer} role="list">
        {/* Map over the workouts array to render a WorkoutCard for each workout */}
        {workouts.map((workout) => (
          // Pass the workout data. No --i style needed here anymore.
          <WorkoutCard key={workout._id} workout={workout} />
        ))}
      </ul>
    </section>
  );
};

export default WorkoutList;