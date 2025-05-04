import React from "react";
// import "./ProgressTracker.css"; // Import the CSS file

const ProgressTracker = ({ progress }) => {
  return (
    <div className="progress-tracker">
      <h3>Progress Tracker</h3>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p>Your progress: {progress}%</p>
    </div>
  );
};

export default ProgressTracker;
