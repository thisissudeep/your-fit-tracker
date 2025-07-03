// utils/exerciseStats.js

export const getInitialExerciseStats = () => ({
  "Push-ups": { sets: 0, reps: 0 },
  "Squats": { sets: 0, reps: 0 },
  "Jumping Jacks": { sets: 0, reps: 0 },
  "Head Rotation": { sets: 0, reps: 0 },
  "Alternate Toe Touch": { sets: 0, reps: 0 },
});


export const updateExerciseStats = (exerciseStats, exerciseName, newReps) => {
    const updatedStats = { ...exerciseStats };

    if (!updatedStats[exerciseName]) {
        updatedStats[exerciseName] = { sets: 0, reps: 0 };
    }

    updatedStats[exerciseName].sets += 1;
    updatedStats[exerciseName].reps += newReps;

    console.log("Updated Exercise Stats:", updatedStats);
    return updatedStats;
};
