import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Key from './Components/Key';
import Settings from './Components/Settings';
import Tanpura from './Components/Tanpura';
import { FaCog } from 'react-icons/fa';
import './App.css';

const initialSettings = {
    Sa: { variation: 'komal', shruti: 'low' },
    Re: { variation: 'teevra', shruti: 'high' },
    Ga: { variation: 'teevra', shruti: 'low' },
    Ma: { variation: 'komal', shruti: 'low' },
    Pa: { variation: 'komal', shruti: 'low' },
    Dha: { variation: 'teevra', shruti: 'low' },
    Ni: { variation: 'teevra', shruti: 'low' },
};

const keyNoteMap = {
    Z: { note: 'Pa', octave: 'low' },
    X: { note: 'Dha', octave: 'low' },
    C: { note: 'Ni', octave: 'low' },
    A: { note: 'Sa', octave: 'mid' },
    S: { note: 'Re', octave: 'mid' },
    D: { note: 'Ga', octave: 'mid' },
    F: { note: 'Ma', octave: 'mid' },
    G: { note: 'Pa', octave: 'mid' },
    H: { note: 'Dha', octave: 'mid' },
    J: { note: 'Ni', octave: 'mid' },
    K: { note: 'Sa', octave: 'high' },
    L: { note: 'Re', octave: 'high' },
    ";": { note: 'Ga', octave: 'high' },
    "'": { note: 'Ma', octave: 'high' },
};

function App() {
    const [audioBuffers, setAudioBuffers] = useState({});
    const [activeSources, setActiveSources] = useState(new Map());
    const [settings, setSettings] = useState(initialSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const audioContextRef = useRef(null);
    const memoizedKeyNoteMap = useMemo(() => keyNoteMap, []);

    // Preload audio buffers
    const preloadAudio = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const context = audioContextRef.current;
        const bufferMap = {};
        const promises = Object.keys(memoizedKeyNoteMap).map((key) => {
            const { note, octave } = memoizedKeyNoteMap[key];
            const { variation, shruti } = settings[note];
            const filename = `${note}_${octave}_${variation}_${shruti}.mp3`;
            const url = `${process.env.PUBLIC_URL}/audio/${filename}`;
            return fetch(url)
                .then(response => response.arrayBuffer())
                .then(data => context.decodeAudioData(data))
                .then(decodedData => {
                    bufferMap[`${note}_${octave}`] = decodedData;
                })
                .catch(err => console.error('Error loading', url, err));
        });
        Promise.all(promises).then(() => {
            setAudioBuffers(bufferMap);
        });
    }, [settings, memoizedKeyNoteMap]);

    useEffect(() => {
        preloadAudio();
    }, [preloadAudio]);

    const playNote = useCallback(
        (note, octave) => {
            const key = `${note}_${octave}`;
            if (audioBuffers[key] && !activeSources.has(key)) {
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffers[key];
                source.loop = true;
                source.connect(audioContextRef.current.destination);
                source.start(0);
                setActiveSources(prev => {
                    const newMap = new Map(prev);
                    newMap.set(key, source);
                    return newMap;
                });
            }
        },
        [audioBuffers, activeSources]
    );

    const stopNote = useCallback(
        (note, octave) => {
            const key = `${note}_${octave}`;
            if (activeSources.has(key)) {
                const source = activeSources.get(key);
                source.stop();
                setActiveSources(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(key);
                    return newMap;
                });
            }
        },
        [activeSources]
    );

    const handleKeyDown = useCallback(
        (event) => {
            const { note, octave } = memoizedKeyNoteMap[event.key.toUpperCase()] || {};
            if (note && octave) {
                playNote(note, octave);
            }
        },
        [playNote, memoizedKeyNoteMap]
    );

    const handleKeyUp = useCallback(
        (event) => {
            const { note, octave } = memoizedKeyNoteMap[event.key.toUpperCase()] || {};
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
            <div className="app-header">
                <h1 className="app-title">22 Shruti Harmonium</h1>
                <p className="app-subtitle">Experience the authentic microtonal harmonium</p>
            </div>

            <div className="keyboard-container">
                <div className="keyboard">
                    {Object.keys(memoizedKeyNoteMap).map((key) => {
                        const { note, octave } = memoizedKeyNoteMap[key];
                        return (
                            <Key
                                key={key}
                                note={note}
                                octave={octave}
                                isActive={activeSources.has(`${note}_${octave}`)}
                                onPlay={() => playNote(note, octave)}
                                onStop={() => stopNote(note, octave)}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="controls-section">

                <Tanpura />

                <div className="instructions">
                    <h2>Keyboard Mapping</h2>
                    <div className="key-mappings">
                        <div className="key-mapping-group">
                            <h3>Lower Octave</h3>
                            <div>Z → Pa, X → Dha, C → Ni</div>
                        </div>
                        <div className="key-mapping-group">
                            <h3>Middle Octave</h3>
                            <div>A → Sa, S → Re, D → Ga, F → Ma</div>
                            <div>G → Pa, H → Dha, J → Ni</div>
                        </div>
                        <div className="key-mapping-group">
                            <h3>Higher Octave</h3>
                            <div>K → Sa, L → Re, ; → Ga, ' → Ma</div>
                        </div>
                    </div>
                </div>
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
        </div>
    );
}

export default App;