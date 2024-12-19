import React, { useEffect, useState, useCallback } from 'react';
import Key from './Components/Key';
import Settings from './Components/Settings';
import { FaCog } from 'react-icons/fa';
import './App.css';

const initialSettings = {
    Pa_low: { variation: 'komal', shruti: 'low' },
    Dha_low: { variation: 'teevra', shruti: 'low' },
    Ni_low: { variation: 'teevra', shruti: 'low' },
    Sa: { variation: 'komal', shruti: 'low' },
    Re: { variation: 'teevra', shruti: 'high' },
    Ga: { variation: 'teevra', shruti: 'low' },
    Ma: { variation: 'komal', shruti: 'low' },
    Pa: { variation: 'komal', shruti: 'low' },
    Dha: { variation: 'teevra', shruti: 'low' },
    Ni: { variation: 'teevra', shruti: 'low' },
    Sa_high: { variation: 'komal', shruti: 'low' },
    Re_high: { variation: 'teevra', shruti: 'high' },
    Ga_high: { variation: 'teevra', shruti: 'low' },
    Ma_high: { variation: 'komal', shruti: 'low' },
    Pa_high: { variation: 'komal', shruti: 'low' },
};

const keyNoteMap = {
    C: 'Pa_low',
    V: 'Dha_low',
    B: 'Ni_low',
    A: 'Sa',
    S: 'Re',
    D: 'Ga',
    F: 'Ma',
    G: 'Pa',
    H: 'Dha',
    J: 'Ni',
    K: 'Sa_high',
    L: 'Re_high',
    Q: 'Ga_high',
    W: 'Ma_high',
    E: 'Pa_high'
};

function App() {
    const [activeKeys, setActiveKeys] = useState([]);
    const [audioMap, setAudioMap] = useState({});
    const [settings, setSettings] = useState(initialSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const preloadAudio = useCallback(() => {
        const audios = {};
        Object.keys(keyNoteMap).forEach((key) => {
            const noteKey = keyNoteMap[key];
            const { variation, octave, shruti } = settings[noteKey];
            const filename = `${noteKey}_${shruti}_${variation}.mp3`;
            audios[noteKey] = new Audio(`${process.env.PUBLIC_URL}/audio/${filename}`);
            audios[noteKey].preload = 'auto';
            audios[noteKey].loop = true;
        });
        setAudioMap(audios);
    }, [settings]);

    useEffect(() => {
        preloadAudio();
    }, [preloadAudio]);

    const playNote = useCallback(
        (note) => {
            if (audioMap[note] && !activeKeys.includes(note)) {
                audioMap[note].currentTime = 0;
                audioMap[note].play();
                setActiveKeys((prev) => [...prev, note]);
            }
        },
        [audioMap, activeKeys]
    );

    const stopNote = useCallback(
        (note) => {
            if (audioMap[note]) {
                audioMap[note].pause();
                audioMap[note].currentTime = 0;
                setActiveKeys((prev) => prev.filter((activeNote) => activeNote !== note));
            }
        },
        [audioMap]
    );

    const handleKeyDown = useCallback(
        (event) => {
            const note = keyNoteMap[event.key.toUpperCase()];
            if (note) {
                playNote(note);
            }
        },
        [playNote]
    );

    const handleKeyUp = useCallback(
        (event) => {
            const note = keyNoteMap[event.key.toUpperCase()];
            if (note) {
                stopNote(note);
            }
        },
        [stopNote]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const updateSetting = (note, field, value) => {
        setSettings((prevSettings) => ({
            ...prevSettings,
            [note]: {
                ...prevSettings[note],
                [field]: value,
            },
        }));
    };

    return (
        <div className="App">
            <h1>22 Shruti Harmonium</h1>
            <div className="keyboard">
                {Object.keys(keyNoteMap).map((key) => (
                    <Key
                        key={key}
                        note={keyNoteMap[key]}
                        isActive={activeKeys.includes(keyNoteMap[key])}
                        onPlay={() => playNote(keyNoteMap[key])}
                        onStop={() => stopNote(keyNoteMap[key])}
                    />
                ))}
            </div>
            <button className="settings-button" onClick={() => setIsSettingsOpen(true)}>
                <FaCog size={24} />
            </button>
            <Settings
                isOpen={isSettingsOpen}
                onRequestClose={() => setIsSettingsOpen(false)}
                settings={settings}
                updateSetting={updateSetting}
            />
            <div className="instructions">
                C: Pa_low |
                V: Dha_low |
                B: Ni_low |
                A: Sa |
                S: Re |
                D: Ga |
                F: Ma |
                G: Pa |
                H: Dha |
                J: Ni |
                K: Sa_high |
                L: Re_high |
                Q: Ga_high |
                W: Ma_high |
                E: Pa_high |
            </div>
        </div>
    );
}

export default App;