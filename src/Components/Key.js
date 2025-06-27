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
            data-octave={octave}
            onMouseDown={onPlay}
            onMouseUp={onStop}
            onMouseLeave={onStop}
            onTouchStart={onPlay}
            onTouchEnd={onStop}
            tabIndex={0}
            role="button"
            aria-label={`Play ${note} ${octave} octave`}
        >
            {displayNote()}
        </div>
    );
};

export default Key;