import React, { useState, useCallback } from 'react';
import WorkoutForm from '../components/WorkoutForm';
import styles from './WorkoutTrackerPage.module.css'; // Import its CSS module

// WorkoutTrackerPage component - contains the workout form
const WorkoutTrackerPage = () => {
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    const handleAddWorkout = useCallback(async (workoutData) => {
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const response = await fetch(API_URL, {
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
    }, [API_URL]);

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