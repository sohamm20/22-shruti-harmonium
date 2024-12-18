import React from 'react';
import './Key.css';

const Key = ({ note, onPlay, onStop, isActive }) => {
    const displayNote = () => {
        // Customize the display based on note variations
        if (note.includes('high')) {
            return note.replace('_high', "'");
        }
        if (note.includes('low')) {
            return note.replace('_low', ",");
        }
        return note;
    };

    return (
        <div
            className={`key ${isActive ? 'active' : ''}`}
            onMouseDown={onPlay}
            onMouseUp={onStop}
            onMouseLeave={onStop} // Ensures sound stops if the mouse leaves the key while pressed
            onTouchStart={onPlay} // For touch devices
            onTouchEnd={onStop}
        >
            {displayNote()}
        </div>
    );
};

export default Key;