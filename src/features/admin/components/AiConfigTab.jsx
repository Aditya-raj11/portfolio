import React from 'react';
import { Settings, Key, Save, Loader2 } from 'lucide-react';

const AiConfigTab = ({ aiConfig, setAiConfig, handleSaveAiSettings, savingSettings }) => {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="glass-panel text-black dark:text-gray-300 rounded-xl shadow-sm overflow-hidden transition-colors">
                <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-lg">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold font-heading text-glossy">AI Assistant</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configure the chatbot behavior.</p>
                    </div>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSaveAiSettings} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gemini API Key</label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="password"
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none font-mono text-sm"
                                    placeholder="AIzaSy..."
                                    value={aiConfig.geminiApiKey || ''}
                                    onChange={(e) => setAiConfig({ ...aiConfig, geminiApiKey: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500">Required for the chatbot to function.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Context / Resume Data</label>
                            <div className="relative">
                                <textarea data-lenis-prevent="true"
                                    rows={12}
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm font-mono leading-relaxed"
                                    placeholder="Paste resume text or context here..."
                                    value={aiConfig.resumeContext || ''}
                                    onChange={(e) => setAiConfig({ ...aiConfig, resumeContext: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500">This text is sent to the AI as system context.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="btn-3d px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-70 disabled:border-b-[4px] disabled:transform-none"
                            >
                                {savingSettings ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Configuration</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AiConfigTab;
