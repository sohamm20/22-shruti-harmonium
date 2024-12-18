

import React from 'react';
import Modal from 'react-modal';
import './Settings.css';
import { FaTimes } from 'react-icons/fa';

Modal.setAppElement('#root'); // For accessibility

const Settings = ({ isOpen, onRequestClose, settings, updateSetting }) => {
    const handleVariationChange = (note, value) => {
        updateSetting(note, 'variation', value);
    };

    const handleShrutiChange = (note, value) => {
        updateSetting(note, 'octave', value);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Settings"
            className="Modal"
            overlayClassName="Overlay"
        >
            <div className="modal-header">
                <h2>Settings</h2>
                <button className="close-button" onClick={onRequestClose} aria-label="Close Settings">
                    <FaTimes />
                </button>
            </div>
            <div className="settings-container">
                {Object.keys(settings).map((note) => (note !== 'Sa_high' && note !==     'Pa_high' && note !== 'Sa' && note !== 'Pa' && note !== 'Pa_low' && (
                    <div key={note} className="note-settings">
                        <h3>{note.replace('_high', "'") && (note.replace('_low', ','))}</h3>
                        <div className="option-group">
                            <label htmlFor={`${note}-variation`}>Variant:</label>
                            <select
                                id={`${note}-variation`}
                                value={settings[note].variation}
                                onChange={(e) => handleVariationChange(note, e.target.value)}
                            >
                                <option value="komal">Komal</option>
                                <option value="teevra">Teevra</option>
                            </select>
                        </div>
                        <div className="option-group">
                            <label htmlFor={`${note}-octave`}>Shruti:</label>
                            <select
                                id={`${note}-octave`}
                                value={settings[note].octave}
                                onChange={(e) => handleShrutiChange(note, e.target.value)}
                            >
                                <option value="low">Lower</option>
                                <option value="high">Higher</option>
                            </select>
                        </div>
                    </div>
                )))}
            </div>
        </Modal>
    );
};

export default Settings;