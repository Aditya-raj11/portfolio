import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Palette } from 'lucide-react';

const PRESET_COLORS = [
    '#22d3ee', // cyan
    '#fbbf24', // amber
    '#38bdf8', // sky
    '#4ade80', // green
    '#60a5fa', // blue
    '#a78bfa', // violet
    '#f472b6', // pink
    '#fb923c', // orange
    '#f87171', // red
    '#34d399', // emerald
    '#e879f9', // fuchsia
    '#94a3b8', // slate
];

const SkillsTab = ({ skills, onAdd, onDelete, saving }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#60a5fa');
    const [showCustom, setShowCustom] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onAdd({ name: name.trim(), color });
        setName('');
        setColor('#60a5fa');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-200 dark:border-[#333] overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-[#333] bg-gray-50/50 dark:bg-[#222]/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills & Technologies</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add your tech stack skills with custom colors. These appear as pills on your portfolio hero section.</p>
                </div>

                <div className="p-6">
                    {/* Add Skill Form */}
                    <form onSubmit={handleAdd} className="mb-8">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="e.g. React, Python, Docker..."
                                className="flex-1 bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={saving || !name.trim()}
                                className="btn-3d px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:border-b-[4px] disabled:transform-none"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Add Skill
                            </button>
                        </div>

                        {/* Color Picker */}
                        <div className="mt-4">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                                <Palette size={14} /> Pill Color
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => { setColor(c); setShowCustom(false); }}
                                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${color === c && !showCustom ? 'border-black dark:border-white scale-110 shadow-md' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                                {/* Custom color input */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowCustom(!showCustom)}
                                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center text-xs font-bold ${showCustom ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-600'} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300`}
                                        title="Custom color"
                                    >
                                        #
                                    </button>
                                </div>
                                {showCustom && (
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    />
                                )}
                                {/* Preview pill */}
                                <div className="ml-3 flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Preview:</span>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
                                        style={{
                                            borderColor: `${color}66`,
                                            color: color,
                                            backgroundColor: `${color}1A`,
                                        }}
                                    >
                                        {name || 'Skill'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Skills List */}
                    {skills.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                            <Palette size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No skills added yet. Add your first skill above.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                {skills.length} skill{skills.length !== 1 ? 's' : ''} added
                            </p>
                            {skills.map((skill) => (
                                <div
                                    key={skill.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 group hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full shadow-sm"
                                            style={{ backgroundColor: skill.color }}
                                        />
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-semibold border"
                                            style={{
                                                borderColor: `${skill.color}66`,
                                                color: skill.color,
                                                backgroundColor: `${skill.color}1A`,
                                            }}
                                        >
                                            {skill.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onDelete(skill.id)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete skill"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillsTab;
