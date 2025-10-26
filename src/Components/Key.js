import React from 'react';
import PropTypes from 'prop-types';

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

    const baseClasses = 'relative flex h-20 w-20 cursor-pointer select-none items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-lg font-semibold text-white shadow-key transition duration-200 ease-out backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-[4.5rem] sm:w-[4.5rem]';
    const activeClasses = isActive
        ? 'translate-y-[-0.25rem] scale-[1.03] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-keyActive'
        : 'hover:translate-y-[-0.4rem] hover:scale-105 hover:bg-white/20 hover:shadow-keyHover';
    const octaveAccent = {
        low: 'border-b-4 border-pink-300/80',
        mid: 'border-b-4 border-sky-300/80',
        high: 'border-b-4 border-cyan-300/80',
    };

    return (
        <div
            className={`${baseClasses} ${octaveAccent[octave]} ${activeClasses}`}
            onMouseDown={onPlay}
            onMouseUp={onStop}
            onMouseLeave={onStop}
            onTouchStart={onPlay}
            onTouchEnd={onStop}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPlay();
                }
            }}
            onKeyUp={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStop();
                }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Play ${note} ${octave} octave`}
            aria-pressed={isActive}
        >
            {displayNote()}
        </div>
    );
};

Key.propTypes = {
    note: PropTypes.string.isRequired,
    octave: PropTypes.oneOf(['low', 'mid', 'high']).isRequired,
    onPlay: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
};

export default React.memo(Key);