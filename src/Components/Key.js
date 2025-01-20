import React from 'react';
import './Key.css';

const Key = ({ note, octave, onPlay, onStop, isActive }) => {
    const displayNote = () => {
        if (octave === 'high') {
            return `${note}'`;
        }
        if (octave === 'low') {
            return `${note},`;
        }
        return note;
    };

    return (
        <div
            className={`key ${isActive ? 'active' : ''}`}
            onMouseDown={onPlay}
            onMouseUp={onStop}
            onMouseLeave={onStop}
            onTouchStart={onPlay}
            onTouchEnd={onStop}
        >
            {displayNote()}
        </div>
    );
};

export default Key;