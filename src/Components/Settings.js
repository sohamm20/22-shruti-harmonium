import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';

Modal.setAppElement('#root');

const Settings = ({ isOpen, onRequestClose, settings, updateSetting }) => {
    const handleVariationChange = (note, value) => {
        updateSetting(note, 'variation', value);
    };

    const handleShrutiChange = (note, value) => {
        updateSetting(note, 'shruti', value);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Settings"
            className="relative mx-auto flex max-h-[85vh] w-[min(90%,44rem)] flex-col gap-8 overflow-y-auto rounded-3xl border border-white/10 bg-surface p-8 text-slate-100 shadow-aurora backdrop-blur-2xl focus:outline-none sm:p-10"
            overlayClassName="fixed inset-0 z-[9999] grid place-items-center bg-black/70 backdrop-blur-md px-4 py-6"
        >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="bg-gradient-to-r from-indigo-300 via-purple-300 to-sky-300 bg-clip-text text-2xl font-semibold text-transparent">Settings</h2>
                <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-white/70 transition duration-200 hover:scale-105 hover:bg-rose-500/20 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={onRequestClose}
                    aria-label="Close Settings"
                >
                    <FaTimes />
                </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.keys(settings)
                    .filter((note) => note !== 'Pa' && note !== 'Sa')
                    .map((note) => (
                        <div
                            key={note}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-200 hover:-translate-y-1 hover:bg-white/10 hover:shadow-lg"
                        >
                            <h3 className="mb-5 text-center text-lg font-semibold text-white">{note}</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor={`${note}-variation`} className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Variant
                                    </label>
                                    <select
                                        id={`${note}-variation`}
                                        value={settings[note].variation}
                                        onChange={(e) => handleVariationChange(note, e.target.value)}
                                        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    >
                                        <option value="komal">Komal</option>
                                        <option value="teevra">Teevra</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor={`${note}-shruti`} className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Shruti
                                    </label>
                                    <select
                                        id={`${note}-shruti`}
                                        value={settings[note].shruti}
                                        onChange={(e) => handleShrutiChange(note, e.target.value)}
                                        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    >
                                        <option value="low">Lower</option>
                                        <option value="high">Higher</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </Modal>
    );
};

Settings.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    settings: PropTypes.objectOf(
        PropTypes.shape({
            variation: PropTypes.oneOf(['komal', 'teevra']).isRequired,
            shruti: PropTypes.oneOf(['low', 'high']).isRequired,
        })
    ).isRequired,
    updateSetting: PropTypes.func.isRequired,
};

export default Settings;