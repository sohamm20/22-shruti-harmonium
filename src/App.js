import React, { useEffect, useState } from 'react';
import Key from './Components/Key';
import Settings from './Components/Settings';
import { FaCog } from 'react-icons/fa';
import './App.css';

const initialSettings = {
  Sa: { variation: 'komal', octave: 'low' },
  Re: { variation: 'komal', octave: 'low' },
  Ga: { variation: 'komal', octave: 'low' },
  Ma: { variation: 'komal', octave: 'low' },
  Pa: { variation: 'komal', octave: 'low' },
  Dha: { variation: 'komal', octave: 'low' },
  Ni: { variation: 'komal', octave: 'low' },
  Saa: { variation: 'komal', octave: 'high' },
};

const keyNoteMap = {
  A: 'Sa',
  S: 'Re',
  D: 'Ga',
  F: 'Ma',
  G: 'Pa',
  H: 'Dha',
  J: 'Ni',
  K: 'Saa',
};

function App() {
  const [activeKeys, setActiveKeys] = useState([]);
  const [audioMap, setAudioMap] = useState({});
  const [settings, setSettings] = useState(initialSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    preloadAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const preloadAudio = () => {
    const audios = {};
    Object.keys(keyNoteMap).forEach((key) => {
      const noteKey = keyNoteMap[key];
      const { variation, octave } = settings[noteKey];
      const filename = noteKey === 'Saa_high'
          ? `Saa_${octave}_${variation}.mp3`
          : `${noteKey}_${octave}_${variation}.mp3`;
      audios[noteKey] = new Audio(`${process.env.PUBLIC_URL}/audio/${filename}`);
      audios[noteKey].preload = 'auto';
      audios[noteKey].loop = true;
    });
    setAudioMap(audios);
  };

  const playNote = (note) => {
    if (audioMap[note]) {
      audioMap[note].currentTime = 0;
      audioMap[note].play();
      setActiveKeys((prev) => [...prev, note]);
    }
  };

  const stopNote = (note) => {
    if (audioMap[note]) {
      audioMap[note].pause();
      audioMap[note].currentTime = 0;
      setActiveKeys((prev) => prev.filter((activeNote) => activeNote !== note));
    }
  };

  const handleKeyDown = (event) => {
    const note = keyNoteMap[event.key.toUpperCase()];
    if (note && !activeKeys.includes(note)) {
      playNote(note);
    }
  };

  const handleKeyUp = (event) => {
    const note = keyNoteMap[event.key.toUpperCase()];
    if (note) {
      stopNote(note);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKeys, audioMap]);

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
          Press keys <strong>A</strong> to <strong>K</strong> or click the keys to play notes.
        </div>
      </div>
  );
}

export default App;