// v2/server/index.js (or your main server file)

require('dotenv').config(); // Keep this for LOCAL development only. Render provides env vars directly.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const workoutRoutes = require('./routes/workoutRoutes'); // Import your workout routes

const app = express();
const PORT = process.env.PORT || 4000; // Correctly uses Render's PORT env var or defaults to 4000 locally

// --- Middleware ---
app.use(express.json()); // Essential for parsing JSON request bodies

// --- CORS Configuration (***IMPORTANT CHANGE HERE***) ---
// Your frontend will be deployed on Render, and its URL will be different from your backend.
// You need to explicitly allow your frontend's domain.
// We'll use an environment variable for the frontend URL, which you'll set on Render.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // Default to local for dev
console.log(`CORS allowing origin: ${FRONTEND_URL}`); // Good for debugging on Render logs

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true // If you are sending cookies or authorization headers from the frontend
}));

// Logging middleware (optional, but good for debugging)
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next(); // Move to the next middleware/route handler
});

// --- Routes ---
// Use the workout routes for any requests to /api/workouts
app.use('/api/workouts', workoutRoutes);

// Add a basic root route for health check / initial connection testing
// This will respond when you visit your backend URL directly in the browser
app.get('/', (req, res) => {
    res.send('Backend API is running for YourFitTracker!');
});

// Database connection
// You are correctly using process.env.MONGO_URI
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