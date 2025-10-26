import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AudioCtor = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;

const silentSetUpdate = (draft, updater) => {
    const next = new Set(draft);
    updater(next);
    return next;
};

const stopAllSources = (sourcesRef) => {
    sourcesRef.current.forEach((source) => {
        try {
            source.stop();
        } catch (error) {
            console.error('Failed to stop source', error);
        }
    });
    sourcesRef.current.clear();
};

export const useAudioEngine = (settings, keyMap) => {
    const audioContextRef = useRef(null);
    const buffersRef = useRef(new Map());
    const activeSourcesRef = useRef(new Map());
    const [activeKeys, setActiveKeys] = useState(() => new Set());
    const [isReady, setIsReady] = useState(false);
    const [loadingError, setLoadingError] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const ensureContext = useCallback(() => {
        if (!AudioCtor) {
            throw new Error('Web Audio API is not supported in this environment.');
        }
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioCtor();
        }
        return audioContextRef.current;
    }, []);

    const uniqueNoteOctaves = useMemo(() => {
        const entries = Object.values(keyMap);
        const deduped = new Map();
        entries.forEach(({ note, octave }) => {
            const key = `${note}_${octave}`;
            if (!deduped.has(key)) {
                deduped.set(key, { note, octave });
            }
        });
        return Array.from(deduped.values());
    }, [keyMap]);

    useEffect(() => {
        if (!AudioCtor) {
            return undefined;
        }

        const context = ensureContext();
        const controller = new AbortController();
        let cancelled = false;

        stopAllSources(activeSourcesRef);
        setActiveKeys(new Set());
        setIsReady(false);
        setLoadingError(null);
        setLoadingProgress(0);

        const preload = async () => {
            const totalFiles = uniqueNoteOctaves.length;
            let loadedFiles = 0;

            const bufferPairs = await Promise.all(
                uniqueNoteOctaves.map(async ({ note, octave }) => {
                    const config = settings[note];
                    if (!config) {
                        return null;
                    }

                    const filename = `${note}_${octave}_${config.variation}_${config.shruti}.mp3`;
                    const url = `${process.env.PUBLIC_URL}/audio/${filename}`;

                    try {
                        const response = await fetch(url, { signal: controller.signal });
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }

                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await context.decodeAudioData(arrayBuffer);

                        loadedFiles++;
                        if (!cancelled) {
                            setLoadingProgress(Math.round((loadedFiles / totalFiles) * 100));
                        }

                        return [`${note}_${octave}`, audioBuffer];
                    } catch (error) {
                        if (controller.signal.aborted) {
                            return null;
                        }
                        console.error('Failed to preload audio', url, error);
                        if (!cancelled) {
                            setLoadingError(`Failed to load ${filename}`);
                        }
                        return null;
                    }
                })
            );

            if (!cancelled) {
                buffersRef.current = new Map(bufferPairs.filter(Boolean));
                setIsReady(true);
            }
        };

        preload().catch((error) => {
            if (!controller.signal.aborted) {
                console.error('Unexpected error while preloading audio buffers', error);
            }
        });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [ensureContext, settings, uniqueNoteOctaves]);

    useEffect(() => () => {
        stopAllSources(activeSourcesRef);
        if (audioContextRef.current) {
            audioContextRef.current.close().catch((error) => {
                console.error('Failed to close AudioContext cleanly', error);
            });
            audioContextRef.current = null;
        }
    }, []);

    const playNote = useCallback(
        (note, octave) => {
            const key = `${note}_${octave}`;
            if (!buffersRef.current.has(key) || activeSourcesRef.current.has(key)) {
                return;
            }

            const context = ensureContext();
            const source = context.createBufferSource();
            source.buffer = buffersRef.current.get(key);
            source.loop = true;
            source.connect(context.destination);
            source.start();
            activeSourcesRef.current.set(key, source);

            setActiveKeys((prev) => silentSetUpdate(prev, (draft) => draft.add(key)));
        },
        [ensureContext]
    );

    const stopNote = useCallback((note, octave) => {
        const key = `${note}_${octave}`;
        const source = activeSourcesRef.current.get(key);
        if (!source) {
            return;
        }

        try {
            source.stop();
        } catch (error) {
            console.error('Failed to stop source', error);
        }

        activeSourcesRef.current.delete(key);
        setActiveKeys((prev) => silentSetUpdate(prev, (draft) => draft.delete(key)));
    }, []);

    return {
        activeKeys,
        playNote,
        stopNote,
        isReady,
        loadingError,
        loadingProgress,
    };
};

export default useAudioEngine;
