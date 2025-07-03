// AICounterPage.jsx
import React, { useState, useCallback } from 'react';
import PushupDetection from '../components/PushupDetection.jsx';
import SquatDetection from '../components/SquatDetection.jsx';
import JumpingJackDetection from '../components/JumpingJackDetection.jsx';
import HeadRotationDetection from '../components/HeadRotationDetection.jsx';
import AlternateToeTouchDetection from '../components/AlternateToeTouchDetection.jsx';
import { EXERCISES } from '../utils/constants';
import { updateExerciseStats } from '../utils/exerciseStats';
import { getInitialExerciseStats } from '../utils/exerciseStats';



const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:4000';

export default function AICounterPage() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [isCounting, setIsCounting] = useState(false);
  const [detectionData, setDetectionData] = useState({ reps: 0, stage: null, status: 'Inactive' });
  const [exerciseStats, setExerciseStats] = useState(getInitialExerciseStats());
  const [saveStatus, setSaveStatus] = useState(null);



  const handleStartStop = () => {
    if (!selectedExercise) {
      window.alert('Please select an exercise first!');
      return;
    }

    if (isCounting) {
      // stopping detection
      const reps = detectionData.reps;
      if (reps > 0) {
        const updatedStats = updateExerciseStats(exerciseStats, selectedExercise, reps);
        setExerciseStats(updatedStats);
      }
      setDetectionData({ reps: 0, stage: null, status: 'Inactive' });
      setIsCounting(false);
    } else {
      // starting detection
      setIsCounting(true);
    }
  };

  const handleDetectionUpdate = useCallback((data) => {
    setDetectionData(data);
  }, []);

  const handleSaveToMongoDB = async () => {
    setSaveStatus(null);

    try {
      const promises = Object.entries(exerciseStats).map(async ([exerciseName, { sets, reps }]) => {
        if (sets > 0 && reps > 0) {
          const res = await fetch(`${API_BASE_URL}/api/workouts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ exerciseName, sets, reps }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to save');
          }
        }
      });

      await Promise.all(promises);

      // When resetting:
      setExerciseStats(() => getInitialExerciseStats());

      setSaveStatus('Success');
    } catch (err) {
      console.error('MongoDB Save Failed:', err);
      setSaveStatus('Error');
    }
  };


  const renderExerciseComponent = () => {
    switch (selectedExercise) {
      case 'Squats': return <SquatDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Push-ups': return <PushupDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Head Rotation': return <HeadRotationDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Jumping Jacks': return <JumpingJackDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Alternate Toe Touch': return <AlternateToeTouchDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      default: return <p style={{ textAlign: 'center', color: 'var(--secondary-text-color)' }}>Select an exercise above to begin.</p>;
    }
  };

  return (
    <div className="ai-counter-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', width: '100%', flexGrow: 1, overflow: 'hidden' }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>AI Powered Counter</h1>

      <div className="controls-container" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <select
          value={selectedExercise}
          onChange={(e) => {
            setSelectedExercise(e.target.value);
            setIsCounting(false);
            setDetectionData({ reps: 0, stage: null, status: `Ready for ${e.target.value || 'an exercise'}. Click Start.` });
          }}
          disabled={isCounting}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--input-border-color)', fontSize: '1.1rem', backgroundColor: 'var(--input-bg-color)', color: 'var(--input-text-color)', cursor: 'pointer' }}
        >
          <option value="">Select Exercise</option>
          {EXERCISES.map((ex) => (
            <option key={ex.value} value={ex.value}>{ex.label}</option>
          ))}
        </select>

        <button
          onClick={handleStartStop}
          disabled={!selectedExercise}
          style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: isCounting ? 'var(--error-color)' : 'var(--button-bg-color)', color: 'white', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          {isCounting ? 'Stop AI Counter' : 'Start AI Counter'}
        </button>


      </div>

      <div className="video-display-container" style={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#000', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', minHeight: '400px', aspectRatio: '16 / 9' }}>
        {renderExerciseComponent()}
      </div>

      <div
        className="exercise-summary-card"
        style={{
          marginTop: '20px',
          width: '100%',
          maxWidth: '800px',
          padding: '20px',
          backgroundColor: 'var(--card-bg-color)',
          color: 'var(--text-color)',
          borderRadius: '8px',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ marginTop: 0, color: 'var(--heading-color)' }}>
          Tracked Exercise Summary
        </h3>
        {Object.entries(exerciseStats).map(([name, { sets, reps }]) => (
          <p key={name}>
            <strong>{name}</strong>: {sets} sets, {reps} reps
          </p>
        ))}
        {saveStatus === 'Success' && (
          <p style={{ color: 'limegreen' }}>Saved to MongoDB!</p>
        )}
        {saveStatus === 'Error' && (
          <p style={{ color: 'orangered' }}>Failed to save to MongoDB.</p>
        )}
      </div>


      <div className="save-exercises-button" style={{ padding: '20px' }}>
        <button
          onClick={handleSaveToMongoDB}
          style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: '#2e8b57', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Save Exercises
        </button>
      </div>
    </div>
  );
}
