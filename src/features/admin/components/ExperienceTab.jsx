import React, { useMemo } from 'react';
import { Upload, Plus, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableGenericItem from './SortableGenericItem';
import MonthYearPicker from '../../../components/ui/MonthYearPicker';

const ExperienceTab = ({
    formData, setFormData,
    handleSubmit, loading, uploadProgress,
    imageFile, setImageFile,
    fetching, items,
    sensors, handleDragEnd,
    handleDelete,
    setCurrentLightboxImages, setCurrentLightboxIndex, setLightboxOpen
}) => {
    // Parse duration into start/end parts
    const { startDate, endDate } = useMemo(() => {
        const dur = formData.duration || '';
        const parts = dur.split(' - ');
        return {
            startDate: parts[0]?.trim() || '',
            endDate: parts[1]?.trim() || ''
        };
    }, [formData.duration]);

    const updateDuration = (start, end) => {
        let duration = '';
        if (start && end) duration = `${start} - ${end}`;
        else if (start) duration = start;
        else if (end) duration = end;
        setFormData({ ...formData, duration });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Item Form */}
            <div className="lg:col-span-1">
                <div className="glass-panel text-black dark:text-gray-300 rounded-xl shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-black/10 dark:border-white/10">
                        <h2 className="text-lg font-semibold font-heading text-glossy">Add Experience</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={(e) => handleSubmit(e, 'experiences')} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                    placeholder="e.g. Full Stack Developer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                    placeholder="e.g. Google"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <MonthYearPicker
                                    label="Start Date"
                                    required
                                    value={startDate}
                                    onChange={(val) => updateDuration(val, endDate)}
                                    placeholder="Start month"
                                />
                                <MonthYearPicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(val) => updateDuration(startDate, val)}
                                    placeholder="End month"
                                    showPresent
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea data-lenis-prevent="true"
                                    required
                                    rows={4}
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all resize-y"
                                    placeholder="What did you do there?"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none transition-all"
                                    placeholder="https://company.com"
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                />
                            </div>

                            {/* Image/PDF Upload */}
                            <div className="space-y-3 pt-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-gray-400" /> Company Logo / PDF <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>

                                <div className="space-y-2">
                                    <div className="relative w-full">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            id="exp-image-upload"
                                            className="hidden"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                        />
                                        <label htmlFor="exp-image-upload" className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-300 dark:border-[#444] rounded-lg py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] cursor-pointer transition-colors">
                                            <Upload size={14} /> {imageFile ? 'Change File' : 'Upload Image'}
                                        </label>
                                    </div>
                                    
                                    {imageFile && (
                                        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/10 dark:border-white/10 text-sm">
                                            <span className="truncate text-black dark:text-white font-medium">{imageFile.name}</span>
                                            <button type="button" onClick={() => setImageFile(null)} className="text-gray-400 hover:text-black dark:hover:text-white"><X size={14} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-3d py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:border-b-[4px] disabled:transform-none"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
                                    </div>
                                ) : <><Plus size={18} /> Add Experience</>}
                            </button>

                            {/* Progress Bar */}
                            {loading && uploadProgress > 0 && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-black dark:bg-white h-2.5 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 h-fit">
                <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-200 dark:border-[#333] flex flex-col overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-gray-50/50 dark:bg-[#222]/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Experience</h2>
                        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{items.length} Total</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {fetching ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="animate-spin text-black dark:text-white" size={32} />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <p>No experience added yet.</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, 'experiences')}
                            >
                                <SortableContext
                                    items={items.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {items.map(item => (
                                            <SortableGenericItem
                                                key={item.id}
                                                item={item}
                                                type="Experience"
                                                onDelete={(i) => handleDelete(i, 'experiences')}
                                                onImageClick={(p) => {
                                                    if (p.imageUrl) {
                                                        setCurrentLightboxImages([p.imageUrl]);
                                                        setCurrentLightboxIndex(0);
                                                        setLightboxOpen(true);
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceTab;
