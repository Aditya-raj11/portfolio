import React from 'react';
import { Upload, Plus, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableGenericItem from './SortableGenericItem';

const AchievementsTab = ({
    formData, setFormData,
    handleSubmit, loading, uploadProgress,
    imageFile, setImageFile,
    fetching, items,
    sensors, handleDragEnd,
    handleDelete,
    setCurrentLightboxImages, setCurrentLightboxIndex, setLightboxOpen
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Item Form */}
            <div className="lg:col-span-1">
                <div className="glass-panel text-black dark:text-gray-300 rounded-xl shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-black/10 dark:border-white/10">
                        <h2 className="text-lg font-semibold font-heading text-glossy">Add Achievement</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={(e) => handleSubmit(e, 'achievements')} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievement Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                    placeholder="e.g. 1st Place in Hackathon"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization / Event</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                        placeholder="e.g. Major League Hacking"
                                        value={formData.organization}
                                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                        placeholder="e.g. August 2024"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <textarea data-lenis-prevent="true"
                                    rows={3}
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all resize-y"
                                    placeholder="Brief description of the achievement..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reference URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none transition-all"
                                    placeholder="https://..."
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                />
                            </div>

                            {/* Image/PDF Upload */}
                            <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <ImageIcon size={16} className="text-gray-400" /> Certificate / Proof Image <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded bg-black/5 dark:bg-white/10 border-black/20 dark:border-white/20 accent-black dark:accent-white"
                                            checked={formData.allowDownload}
                                            onChange={(e) => setFormData({...formData, allowDownload: e.target.checked})}
                                        />
                                        Allow Public Downloading
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative w-full">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            id="ach-image-upload"
                                            className="hidden"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                        />
                                        <label htmlFor="ach-image-upload" className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-300 dark:border-[#444] rounded-lg py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] cursor-pointer transition-colors">
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
                                className="w-full btn-3d py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:border-b-[4px] disabled:transform-none mt-4"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
                                    </div>
                                ) : <><Plus size={18} /> Add Achievement</>}
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
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Achievements</h2>
                        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{items.length} Total</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {fetching ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="animate-spin text-black dark:text-white" size={32} />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <p>No achievements added yet.</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, 'achievements')}
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
                                                type="Achievement"
                                                onDelete={(i) => handleDelete(i, 'achievements')}
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

export default AchievementsTab;
