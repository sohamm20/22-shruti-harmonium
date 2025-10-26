import React, { useState, useRef, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const Tanpura = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorage('tanpura-volume', 30);
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
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="surface-card flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-white">Tanpura</h2>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 px-5 py-2.5 text-sm font-semibold text-white shadow-badge transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={toggleTanpura}
        >
          {isPlaying ? 'Stop Tanpura' : 'Start Tanpura'}
        </button>
        <div className="flex w-full flex-col gap-2 md:max-w-xs">
          <label htmlFor="tanpura-volume" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Volume
          </label>
          <input
            id="tanpura-volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="h-1.5 w-full appearance-none rounded-full bg-white/10 accent-purple-400"
          />
        </div>
      </div>
    </div>
  );
};

export default Tanpura;
