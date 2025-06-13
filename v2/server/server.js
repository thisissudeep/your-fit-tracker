require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const workoutRoutes = require('./routes/workoutRoutes'); // Import your new workout routes

const app = express();
const PORT = process.env.PORT;

// --- Middleware ---
app.use(express.json()); // Essential for parsing JSON request bodies
app.use(cors());         // Enable CORS

// Logging middleware (optional, but good for debugging)
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next(); // Move to the next middleware/route handler
});

// --- Routes ---
// Use the workout routes for any requests to /api/workouts
app.use('/api/workouts', workoutRoutes);


//Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        // Start the server AFTER successful DB connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        // You might want to exit the process if DB connection fails
        process.exit(1);
    });


// Basic error handling middleware (optional but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});