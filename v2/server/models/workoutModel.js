const mongoose = require('mongoose');

// Define the schema for a single workout
const workoutSchema = new mongoose.Schema({
    exerciseName: {
        type: String,
        required: true,
        trim: true // Removes whitespace from both ends of a string
    },
    sets: {
        type: Number,
        required: true,
        min: 1 // Minimum number of sets
    },
    reps: {
        type: Number,
        required: true,
        min: 1 // Minimum number of reps
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create the Mongoose model from the schema
const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;