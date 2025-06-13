const Workout = require('../models/workoutModel'); // Import the Workout model

// --- GET all workouts ---
// This function will handle fetching all workouts
const getWorkouts = async (req, res) => {
    try {
        // Find all workouts, sort by creation date (newest first)
        // The empty object {} means match all documents
        // { createdAt: -1 } sorts in descending order of createdAt
        const workouts = await Workout.find({}).sort({ createdAt: -1 });

        // Send back a 200 OK status with the workouts as JSON
        res.status(200).json(workouts);
    } catch (error) {
        // If an error occurs during database interaction,
        // send back a 500 Internal Server Error status
        // with the error message
        console.error("Error fetching workouts:", error.message); // Log the server-side error for debugging
        res.status(500).json({ error: 'Failed to retrieve workouts. Please try again later.' });
    }
};

// --- POST a new workout ---
// This function will handle creating a new workout
const createWorkout = async (req, res) => {
    // Destructure the input fields from the request body
    const { exerciseName, sets, reps } = req.body;

    // Basic validation to ensure all required fields are present
    if (!exerciseName || !sets || !reps) {
        // If any field is missing, send a 400 Bad Request
        // and an informative error message to the client
        return res.status(400).json({ error: 'Please fill in all the fields: Exercise Name, Sets, Reps.' });
    }

    // Validate that sets and reps are positive numbers
    // This is crucial for data integrity before saving to the database
    if (typeof sets !== 'number' || sets <= 0) {
        return res.status(400).json({ error: 'Sets must be a positive number.' });
    }
    if (typeof reps !== 'number' || reps <= 0) {
        return res.status(400).json({ error: 'Reps must be a positive number.' });
    }

    try {
        // Create a new workout document in the MongoDB collection
        // Mongoose will automatically apply schema validations here
        const workout = await Workout.create({ exerciseName, sets, reps });

        // Send back a 201 Created status with the newly created workout object
        res.status(201).json(workout);
    } catch (error) {
        // If Mongoose validation fails (e.g., due to schema constraints like 'required')
        // or any other database error occurs during creation,
        // send back a 400 Bad Request with the error message
        console.error("Error creating workout:", error.message); // Log the server-side error
        res.status(400).json({ error: error.message }); // Use error.message for validation errors
    }
};

// Export the controller functions so they can be imported and used by the router
module.exports = {
    getWorkouts,
    createWorkout
};