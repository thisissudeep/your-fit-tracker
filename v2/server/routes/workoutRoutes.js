const express = require('express');
// Import the controller functions instead of the model directly
const { getWorkouts, createWorkout, deleteWorkout } = require('../controllers/workoutController');

const router = express.Router(); // Create an Express router instance

// --- GET all workouts ---
// GET /api/workouts
// Route now just points to the controller function
router.get('/', getWorkouts);

// --- POST a new workout ---
// POST /api/workouts
// Route now just points to the controller function
router.post('/', createWorkout);

// DELETE /api/workouts/:id
router.delete('/:id', deleteWorkout);

module.exports = router;