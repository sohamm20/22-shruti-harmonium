import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Key from './Components/Key';
import Settings from './Components/Settings';
import { FaCog } from 'react-icons/fa';
import './App.css';
// ...existing code...

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
    // ...existing state...
    const [audioBuffers, setAudioBuffers] = useState({});
    const [activeSources, setActiveSources] = useState(new Map());
    const [settings, setSettings] = useState(initialSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const audioContextRef = useRef(null);

    // New state for drone functionality
    const [droneNote, setDroneNote] = useState("Sa");
    const [droneSource, setDroneSource] = useState(null);

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

    // Drone functions
    const toggleDrone = () => {
        if (droneSource) {
            droneSource.stop();
            setDroneSource(null);
        } else {
            const key = `${droneNote}_mid`;
            if (audioBuffers[key]) {
                const gainNode = audioContextRef.current.createGain();
                gainNode.gain.value = 0.33; // set volume to 66%
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffers[key];
                source.loop = true;
                source.connect(gainNode);
                gainNode.connect(audioContextRef.current.destination);
                source.start(0);
                setDroneSource(source);
            } else {
                console.error("Audio buffer not loaded for drone key:", key);
            }
        }
    };

    return (
        <div className="App">
            <h1>22 Shruti Harmonium</h1>
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
            <button className="settings-button" onClick={() => setIsSettingsOpen(true)}>
                <FaCog size={24} />
            </button>
            <Settings
                isOpen={isSettingsOpen}
                onRequestClose={() => setIsSettingsOpen(false)}
                settings={settings}
                updateSetting={updateSetting}
            />
            {/* Drone Controller */}
            <div className="drone-controller" style={{marginTop: '20px'}}>
                <h2>Drone Control</h2>
                <select value={droneNote} onChange={e => setDroneNote(e.target.value)}>
                    <option value="Sa">Sa</option>
                    <option value="Re">Re</option>
                    <option value="Ga">Ga</option>
                    <option value="Ma">Ma</option>
                    <option value="Pa">Pa</option>
                    <option value="Dha">Dha</option>
                    <option value="Ni">Ni</option>
                </select>
                <button onClick={toggleDrone} style={{marginLeft: '10px'}}>
                    {droneSource ? "Stop Drone" : "Start Drone"}
                </button>
            </div>
            <br/>
            <br/>
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