import React, { useState, useEffect, useCallback } from 'react'; // Import hooks
import WorkoutList from '../components/WorkoutList';
import styles from './DashboardPage.module.css'; // Import CSS Module
import appStyles from '../App.css'; // Import App.css for global styles - assuming this is correct path

// Get the base API URL from the environment variables.
// This will be 'http://localhost:4000' in development
// and 'https://your-fit-tracker-backend.onrender.com' in production.
const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const DashboardPage = () => {
  // State to store the list of workouts fetched from the backend.
  const [workouts, setWorkouts] = useState([]);
  // State for handling loading status and errors specific to the workout list.
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = null;

  // --- Function to fetch all workouts (memoized with useCallback) ---
  // useCallback is used here to prevent this function from being re-created
  // on every render, thus preventing unnecessary re-runs of the useEffect.
  const fetchWorkouts = useCallback(async () => {
    setListLoading(true); // Set loading state for the list to true
    setListError(null);   // Clear any previous list errors
    try {
      // Construct the full API URL by appending the endpoint
      const response = await fetch(`${API_BASE_URL}/api/workouts`);
      if (!response.ok) {
        // If the HTTP response status is not OK (e.g., 404, 500), throw an error.
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Parse the JSON response body.
      const data = await response.json();
      setWorkouts(data); // Update the workouts state with the fetched data.
    } catch (err) {
      console.error("Failed to fetch workouts:", err); // Log the detailed error to console.
      setListError("Failed to load workouts. Please check your backend server and internet connection."); // Set user-friendly error message.
    } finally {
      setListLoading(false); // Reset loading state for the list.
    }
  }, []); // Removed API_URL from dependencies, as API_BASE_URL is now a constant

  // --- useEffect hook to fetch workouts when the component mounts ---
  // This effect runs once when the DashboardPage component first renders.
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]); // Dependency array: ensures effect re-runs if fetchWorkouts function itself changes.

  return (
    <div className={styles.dashboardPage}>
      {/* Apply the global class for white text and restore the heading text */}
      <WorkoutList
        workouts={workouts} // Pass the fetched workouts
        listLoading={listLoading} // Pass loading state
        listError={listError} // Pass error state
      />
    </div>
  );
};

export default DashboardPage;