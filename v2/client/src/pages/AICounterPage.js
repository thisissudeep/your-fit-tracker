import React, { useState, useCallback } from 'react'; // Import useCallback
// Correctly import each detection component from its own .jsx file
import PushupDetection from '../components/PushupDetection.jsx';
import SquatDetection from '../components/SquatDetection.jsx';
import JumpingJackDetection from '../components/JumpingJackDetection.jsx';
import HeadRotationDetection from '../components/HeadRotationDetection.jsx';
import AlternateToeTouchDetection from '../components/AlternateToeTouchDetection.jsx';
import { EXERCISES } from '../utils/constants'; // Assuming this file is correct and exists

export default function AICounterPage() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [isCounting, setIsCounting] = useState(false);
  const [detectionData, setDetectionData] = useState({ reps: 0, stage: null, status: 'Inactive' });

  const handleStartStop = () => {
    if (selectedExercise) {
      setIsCounting(!isCounting);
      // Reset state when stopping
      if (isCounting) {
        setDetectionData({ reps: 0, stage: null, status: 'Inactive' });
      }
    } else {
      // NOTE: Using window.alert for now. For production, consider a custom modal.
      window.alert('Please select an exercise first!');
    }
  };

  // CRITICAL FIX: Wrap handleDetectionUpdate in useCallback
  const handleDetectionUpdate = useCallback((data) => {
    setDetectionData(data);
  }, []); // Empty dependency array means this function reference is stable

  const renderExerciseComponent = () => {
    // Only render the component if an exercise is selected and isCounting is true
    // Or if detectionData.status implies loading (e.g., "Requesting camera access...")
    if (!selectedExercise) {
      return <p style={{ textAlign: 'center', color: 'var(--secondary-text-color)' }}>Select an exercise above to begin.</p>;
    }

    switch (selectedExercise) {
      case 'Squats':
        return <SquatDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Push-ups':
        return <PushupDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Head Rotation':
        return <HeadRotationDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Jumping Jacks':
        return <JumpingJackDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      case 'Alternate Toe Touch':
        return <AlternateToeTouchDetection isActive={isCounting} onDetectionUpdate={handleDetectionUpdate} />;
      default:
        return <p style={{ textAlign: 'center', color: 'var(--error-color)' }}>Invalid exercise selected.</p>;
    }
  };

  return (
    // Main container for the AI Counter Page
    <div
      className="ai-counter-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        width: '100%',
        flexGrow: 1, // Allow this div to grow and take available space
        overflow: 'hidden', // Hide any overflow from children
      }}
    >
      <h1 style={{ color: 'var(--heading-color)', marginBottom: '30px' }}>AI Powered Counter</h1>

      {/* Controls Container */}
      <div
        className="controls-container"
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          flexWrap: 'wrap', // Allow controls to wrap on smaller screens
          justifyContent: 'center'
        }}
      >
        <select
          value={selectedExercise}
          onChange={(e) => {
            setSelectedExercise(e.target.value);
            setIsCounting(false); // Stop counting when selection changes
            setDetectionData({ reps: 0, stage: null, status: `Ready for ${e.target.value || 'an exercise'}. Click Start.` });
          }}
          disabled={isCounting}
          style={{
            padding: '10px 15px', // Increased padding
            borderRadius: '8px', // More rounded corners
            border: '1px solid var(--input-border-color)', // Theme-aware border
            fontSize: '1.1rem', // Larger font
            backgroundColor: 'var(--input-bg-color)', // Theme-aware background
            color: 'var(--input-text-color)', // Theme-aware text color
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <option value="">Select Exercise</option>
          {EXERCISES.map((ex) => (
            <option key={ex.value} value={ex.value}>
              {ex.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleStartStop}
          disabled={!selectedExercise}
          style={{
            padding: '12px 25px', // Increased padding
            borderRadius: '8px', // More rounded corners
            border: 'none',
            backgroundColor: isCounting ? 'var(--error-color)' : 'var(--button-bg-color)', // Red for Stop, primary for Start
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.1rem', // Larger font
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease, transform 0.1s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          {isCounting ? 'Stop AI Counter' : 'Start AI Counter'}
        </button>
      </div>

      {/* Detection Output */}
      <div
        className="detection-output"
        style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: 'var(--card-bg-color)',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          textAlign: 'left',
          fontSize: '1.1em',
          color: 'var(--text-color)',
          marginBottom: '20px' // Added margin to separate from video container
        }}
      >
        <h3 style={{ marginTop: 0, color: 'var(--heading-color)' }}>Detection Results:</h3>
        <p><strong>Reps:</strong> {detectionData.reps}</p>
        <p><strong>Stage:</strong> {detectionData.stage || 'N/A'}</p>
        <p><strong>Status:</strong> {detectionData.status}</p>
        {/* Display angles/distances only if available (conditionally render) */}
        {detectionData.leftElbowAngle !== undefined && <p><strong>Left Elbow:</strong> {detectionData.leftElbowAngle.toFixed(0)}°</p>}
        {detectionData.rightElbowAngle !== undefined && <p><strong>Right Elbow:</strong> {detectionData.rightElbowAngle.toFixed(0)}°</p>}
        {detectionData.leftKneeAngle !== undefined && <p><strong>Left Knee:</strong> {detectionData.leftKneeAngle.toFixed(0)}°</p>}
        {detectionData.rightKneeAngle !== undefined && <p><strong>Right Knee:</strong> {detectionData.rightKneeAngle.toFixed(0)}°</p>}
        {detectionData.headAngle !== undefined && <p><strong>Head Angle:</strong> {detectionData.headAngle.toFixed(0)}°</p>}
        {detectionData.lhrfDistance !== undefined && <p><strong>Left Hand to Right Foot:</strong> {detectionData.lhrfDistance.toFixed(0)}</p>}
        {detectionData.rhlfDistance !== undefined && <p><strong>Right Hand to Left Foot:</strong> {detectionData.rhlfDistance.toFixed(0)}</p>}
      </div>

      {/* Video Display Container - This is where the selected exercise component will render */}
      <div
        className="video-display-container"
        style={{
          width: '100%',
          flexGrow: 1, // This makes it take up all available vertical space
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden', // Important for contained video
          backgroundColor: '#000', // Black background for video area
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          minHeight: '400px', // Ensure a minimum height for the video area
          aspectRatio: '16 / 9' // Maintain aspect ratio even if flexGrow takes over
        }}
      >
        {renderExerciseComponent()}
      </div>
    </div>
  );
}