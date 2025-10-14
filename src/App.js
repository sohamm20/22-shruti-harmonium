import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Key from './Components/Key';
import Settings from './Components/Settings';
import Tanpura from './Components/Tanpura';
import { FaCog } from 'react-icons/fa';

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
    C: { note: 'Pa', octave: 'low' },
    V: { note: 'Dha', octave: 'low' },
    B: { note: 'Ni', octave: 'low' },
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

const keyboardLegend = [
    { title: 'Lower Octave', items: ["C → Pa", "V → Dha", "B → Ni"] },
    { title: 'Middle Octave', items: ["A → Sa", "S → Re", "D → Ga", "F → Ma", "G → Pa", "H → Dha", "J → Ni"] },
    { title: 'Higher Octave', items: ["K → Sa", "L → Re", "; → Ga", "' → Ma"] },
];

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
        <div className="relative flex min-h-screen flex-col gap-10 overflow-x-hidden bg-background bg-aurora px-4 py-12 font-sans text-slate-100 sm:px-6 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-white/5" aria-hidden />

            <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-6 sm:items-center">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">22 Shruti Harmonium</h1>
                    </div>
                    <button
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium transition duration-200 ease-out backdrop-blur-md hover:-translate-y-0.5 hover:border-indigo-300/80 hover:bg-indigo-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        onClick={() => setIsSettingsOpen(true)}
                        type="button"
                        aria-label="Open settings"
                    >
                        <FaCog size={18} />
                        <span>Settings</span>
                    </button>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                    Experience the authentic microtonal harmonium
                </p>
            </header>

            <main className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.9fr)]">
                <section className="surface-card flex flex-col gap-6">
                    <div className="panel-heading">
                        <h2>Keyboard</h2>
                        <p>Click or press the mapped keys to sustain each note.</p>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(4.5rem,1fr))] justify-items-center gap-3 sm:gap-3.5">
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
                </section>

                <aside className="flex flex-col gap-6 lg:gap-8">
                    <Tanpura />
                    <section className="surface-card">
                        <div className="panel-heading">
                            <h2 className="bg-gradient-to-r from-pink-300 via-purple-300 to-sky-300 bg-clip-text text-transparent">Keyboard Mapping</h2>
                            <p>Use your computer keyboard to trigger each octave grouping.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))]">
                            {keyboardLegend.map(({ title, items }) => (
                                <div key={title} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <h3 className="text-base font-semibold text-slate-100">{title}</h3>
                                    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-slate-400">
                                        {items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </main>

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