import React, { useState } from 'react';
import styles from './WorkoutForm.module.css'; // Import CSS Module for local styling

// WorkoutForm component for adding new workouts.
// It receives a submission handler, loading, error, and success states as props
// from its parent (HomePage).
const WorkoutForm = ({ onAddWorkout, isLoading, formError, formSuccess }) => {
  // State for the form input fields, managed locally within this component.
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  // Handles the form submission event.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission (page reload).

    // Basic client-side validation: Check if fields are not empty.
    if (!exerciseName.trim() || !sets || !reps) {
      // Instead of alert(), we will let the formError prop from HomePage handle it.
      // HomePage will set the formError if any validation (client-side or server-side) fails.
      return;
    }

    // Pass the workout data up to the parent component's handler (onAddWorkout)
    // The parent (HomePage) will handle the API call and update global state.
    const result = await onAddWorkout({
      exerciseName: exerciseName.trim(), // Trim whitespace from exercise name
      sets: Number(sets), // Convert sets to a number
      reps: Number(reps)   // Convert reps to a number
    });

    // If the submission was successful as indicated by the parent's handler, clear the form.
    if (result && result.success) {
      setExerciseName('');
      setSets('');
      setReps('');
    }
  };

  return (
    <div className={styles.card}> {/* Main card container */}
      <div className={styles.cardHeading}>
        <h2>
          Add Your Workout
          <small>Track your progress!</small>
        </h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.cardForm}>
        {/* Exercise Name Input */}
        <div className={styles.input}>
          <input
            type="text"
            id="exerciseName"
            className={styles.inputField}
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            required
            aria-label="Exercise Name"
          />
          <label htmlFor="exerciseName" className={styles.inputLabel}>Exercise Name</label>
        </div>

        {/* Sets Input */}
        <div className={styles.input}>
          <input
            type="number"
            id="sets"
            className={styles.inputField}
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            required
            min="1"
            aria-label="Sets"
          />
          <label htmlFor="sets" className={styles.inputLabel}>Sets</label>
        </div>

        {/* Reps Input */}
        <div className={styles.input}>
          <input
            type="number"
            id="reps"
            className={styles.inputField}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
            min="1"
            aria-label="Reps"
          />
          <label htmlFor="reps" className={styles.inputLabel}>Reps</label>
        </div>

        {/* Action Button */}
        <div className={styles.action}>
          <button type="submit" disabled={isLoading} className={styles.actionButton}>
            {isLoading ? 'Adding Workout...' : 'Add Workout'}
          </button>
        </div>

        {/* Messages */}
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        {formSuccess && <p className={styles.successMessage}>{formSuccess}</p>}
      </form>
      {/* Removed the "card-info" section as it's not relevant for this form */}
    </div>
  );
};

export default WorkoutForm;