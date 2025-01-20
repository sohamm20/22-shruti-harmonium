import React, {useEffect, useState, useCallback, useMemo} from 'react';
import Key from './Components/Key';
import Settings from './Components/Settings';
import {FaCog} from 'react-icons/fa';
import './App.css';

const initialSettings = {
    Sa: {variation: 'komal', shruti: 'low'},
    Re: {variation: 'teevra', shruti: 'high'},
    Ga: {variation: 'teevra', shruti: 'low'},
    Ma: {variation: 'komal', shruti: 'low'},
    Pa: {variation: 'komal', shruti: 'low'},
    Dha: {variation: 'teevra', shruti: 'low'},
    Ni: {variation: 'teevra', shruti: 'low'},
};

const keyNoteMap = {
    Z: {note: 'Pa', octave: 'low'},
    X: {note: 'Dha', octave: 'low'},
    C: {note: 'Ni', octave: 'low'},
    A: {note: 'Sa', octave: 'mid'},
    S: {note: 'Re', octave: 'mid'},
    D: {note: 'Ga', octave: 'mid'},
    F: {note: 'Ma', octave: 'mid'},
    G: {note: 'Pa', octave: 'mid'},
    H: {note: 'Dha', octave: 'mid'},
    J: {note: 'Ni', octave: 'mid'},
    K: {note: 'Sa', octave: 'high'},
    L: {note: 'Re', octave: 'high'},
    ";": {note: 'Ga', octave: 'high'},
    "'": {note: 'Ma', octave: 'high'},
};

function App() {
    const [activeKeys, setActiveKeys] = useState(new Set());
    const [audioMap, setAudioMap] = useState({});
    const [settings, setSettings] = useState(initialSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const memoizedKeyNoteMap = useMemo(() => keyNoteMap, []);

    const preloadAudio = useCallback(() => {
        const audios = {};
        Object.keys(memoizedKeyNoteMap).forEach((key) => {
            const {note, octave} = memoizedKeyNoteMap[key];
            const {variation, shruti} = settings[note];
            const filename = `${note}_${octave}_${variation}_${shruti}.mp3`;
            audios[`${note}_${octave}`] = new Audio(`${process.env.PUBLIC_URL}/audio/${filename}`);
            audios[`${note}_${octave}`].preload = 'auto';
            audios[`${note}_${octave}`].loop = true;
        });
        setAudioMap(audios);
    }, [settings, memoizedKeyNoteMap]);

    useEffect(() => {
        preloadAudio();
    }, [preloadAudio]);

    const playNote = useCallback(
        (note, octave) => {
            const key = `${note}_${octave}`;
            if (audioMap[key] && !activeKeys.has(key)) {
                audioMap[key].currentTime = 0;
                audioMap[key].play();
                setActiveKeys(prev => new Set(prev).add(key));
            }
        },
        [audioMap, activeKeys]
    );

    const stopNote = useCallback(
        (note, octave) => {
            const key = `${note}_${octave}`;
            if (audioMap[key]) {
                audioMap[key].pause();
                audioMap[key].currentTime = 0;
                setActiveKeys(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(key);
                    return newSet;
                });
            }
        },
        [audioMap]
    );

    const handleKeyDown = useCallback(
        (event) => {
            const {note, octave} = memoizedKeyNoteMap[event.key.toUpperCase()] || {};
            if (note && octave) {
                playNote(note, octave);
            }
        },
        [playNote, memoizedKeyNoteMap]
    );

    const handleKeyUp = useCallback(
        (event) => {
            const {note, octave} = memoizedKeyNoteMap[event.key.toUpperCase()] || {};
            if (note && octave) {
                stopNote(note, octave);
            }
        },
        [stopNote, memoizedKeyNoteMap]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const updateSetting = useCallback((note, field, value) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [note]: {
                ...prevSettings[note],
                [field]: value,
            },
        }));
    }, []);

    return (
        <div className="App">
            <h1>22 Shruti Harmonium</h1>
            <div className="keyboard">
                {Object.keys(memoizedKeyNoteMap).map((key) => {
                    const {note, octave} = memoizedKeyNoteMap[key];
                    return (
                        <Key
                            key={key}
                            note={note}
                            octave={octave}
                            isActive={activeKeys.has(`${note}_${octave}`)}
                            onPlay={() => playNote(note, octave)}
                            onStop={() => stopNote(note, octave)}
                        />
                    );
                })}
            </div>
            <button className="settings-button" onClick={() => setIsSettingsOpen(true)}>
                <FaCog size={24}/>
            </button>
            <Settings
                isOpen={isSettingsOpen}
                onRequestClose={() => setIsSettingsOpen(false)}
                settings={settings}
                updateSetting={updateSetting}
            />
            <br></br>
            <br></br>
            <h2>Key to Notes Map</h2>
            <div className="instructions">
                (Z : Pa Low) (X : Dha Low) (C : Ni Low)
                (A : Sa Mid) (S : Re Mid) (D : Ga Mid)
                (F : Ma Mid) (G : Pa Mid) (H : Dha Mid)
                (J : Ni Mid) (K : Sa High) (L : Re High)
                (Q : Ga High) (W : Ma High) (E : Pa High)
                (R : Dha High) (T : Ni High)
            </div>
        </div>
    );
}

export default App;