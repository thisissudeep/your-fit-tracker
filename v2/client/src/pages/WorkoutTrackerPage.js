import React, { useState, useCallback } from 'react';
import WorkoutForm from '../components/WorkoutForm';
import styles from './WorkoutTrackerPage.module.css'; // Import its CSS module

// Get the base API URL from the environment variables.
// This will be 'http://localhost:4000' in development
// and 'https://your-fit-tracker-backend.onrender.com' in production.
const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

// WorkoutTrackerPage component - contains the workout form
const WorkoutTrackerPage = () => {
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    const handleAddWorkout = useCallback(async (workoutData) => {
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            // Construct the full API URL by appending the endpoint
            const response = await fetch(`${API_BASE_URL}/api/workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workoutData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            setFormSuccess('Workout added successfully!');
            return { success: true };
        } catch (err) {
            console.error("Failed to add workout:", err);
            setFormError(err.message);
            return { success: false, error: err.message };
        } finally {
            setFormLoading(false);
        }
    }, []); // Removed API_URL from dependencies, as API_BASE_URL is now a constant

    return (
        <div className={styles.workoutTrackerPage}> {/* Apply module-scoped class */}
            <WorkoutForm
                onAddWorkout={handleAddWorkout}
                isLoading={formLoading}
                formError={formError}
                formSuccess={formSuccess}
            />
        </div>
    );
};

export default WorkoutTrackerPage;