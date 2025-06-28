import React, { useState, useRef } from 'react';
import './Tanpura.css';

const Tanpura = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleTanpura = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/tanpura.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Set lower volume for background ambience
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing tanpura:', error);
      });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    if (audioRef.current) {
      audioRef.current.volume = e.target.value / 100;
    }
  };

  return (
    <div className="tanpura-controller">
      <h2 className="tanpura-title">Tanpura</h2>
      <div className="tanpura-controls">
        <button 
          className="tanpura-button"
          onClick={toggleTanpura}
        >
          {isPlaying ? 'Stop Tanpura' : 'Start Tanpura'}
        </button>
        <div className="volume-control">
          <label htmlFor="tanpura-volume">Volume:</label>
          <input
            id="tanpura-volume"
            type="range"
            min="0"
            max="100"
            defaultValue="30"
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default Tanpura;
