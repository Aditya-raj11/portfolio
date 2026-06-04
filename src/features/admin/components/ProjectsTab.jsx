import React from 'react';
import { Upload, Plus, Loader2, Image as ImageIcon, Smartphone, X, Pencil } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableProjectItem from './SortableProjectItem';

const ProjectsTab = ({
    formData, setFormData,
    handleSubmit, loading, uploadProgress,
    projectImageFiles, setProjectImageFiles,
    currentImageUrl, setCurrentImageUrl, handleAddImageUrl,
    imageUrls, removeImageUrl,
    apkFile, setApkFile,
    fetching, projects,
    sensors, handleDragEnd,
    handleToggleFeatured, handleDelete,
    setCurrentLightboxImages, setCurrentLightboxIndex, setLightboxOpen,
    editingProjectId, onCancelEdit, onEdit
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Project Form */}
            <div className="lg:col-span-1">
                <div className="glass-panel text-black dark:text-gray-300 rounded-xl shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                        <h2 className="text-lg font-semibold font-heading text-glossy">
                            {editingProjectId ? 'Edit Project' : 'Add New Project'}
                        </h2>
                        {editingProjectId && (
                            <button
                                type="button"
                                onClick={onCancelEdit}
                                className="text-xs font-semibold px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                    placeholder="e.g. Portfolio v2"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <div className="flex bg-gray-100 dark:bg-[#111] p-1 rounded-lg border border-black/5 dark:border-white/10">
                                    <button
                                        type="button"
                                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${formData.category === 'app' ? 'bg-white dark:bg-[#333] text-black dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                                        onClick={() => setFormData({ ...formData, category: 'app' })}
                                    >
                                        Mobile App
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${formData.category === 'website' ? 'bg-white dark:bg-[#333] text-black dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                                        onClick={() => setFormData({ ...formData, category: 'website' })}
                                    >
                                        Website
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${formData.category === 'github' ? 'bg-white dark:bg-[#333] text-black dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                                        onClick={() => setFormData({ ...formData, category: 'github' })}
                                    >
                                        GitHub Repo
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea data-lenis-prevent="true"
                                    required
                                    rows={4}
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                    placeholder="Brief description of the project..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Tech Stack */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tech Stack <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                                <input
                                    type="text"
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white outline-none transition-all"
                                    placeholder="e.g. React, Firebase, TailwindCSS"
                                    value={formData.techStack}
                                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                />
                            </div>

                            {/* Screenshots */}
                            <div className="space-y-3 pt-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-gray-400" /> Screenshots
                                </label>

                                <div className="space-y-2">
                                    <div className="relative w-full">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const filesArray = Array.from(e.target.files);
                                                    setProjectImageFiles(prev => [...prev, ...filesArray]);
                                                }
                                            }}
                                        />
                                        <label htmlFor="file-upload" className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-300 dark:border-[#444] rounded-lg py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] cursor-pointer transition-colors">
                                            <Upload size={14} /> Upload Image Files
                                        </label>
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="text"
                                            className="flex-1 bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-black/50 dark:border-white/50 text-gray-900 dark:text-white"
                                            placeholder="Or paste URL..."
                                            value={currentImageUrl}
                                            onChange={(e) => setCurrentImageUrl(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                                        />
                                        <button type="button" onClick={handleAddImageUrl} className="bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 px-4 rounded-lg border border-gray-300 dark:border-[#444] font-medium text-sm transition-colors">Add</button>
                                    </div>
                                </div>

                                {/* Preview List */}
                                <div className="space-y-2">
                                    {projectImageFiles && projectImageFiles.map((file, idx) => (
                                        <div key={`file-${idx}`} className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/10 dark:border-white/10 text-sm">
                                            <span className="truncate text-black dark:text-white font-medium">{file.name}</span>
                                            <button type="button" onClick={() => setProjectImageFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-black dark:hover:text-white"><X size={14} /></button>
                                        </div>
                                    ))}
                                    {imageUrls.map((url, idx) => (
                                        <div key={`url-${idx}`} className="flex items-center justify-between bg-gray-50 dark:bg-[#222]/50 p-2 rounded-lg border border-gray-200 dark:border-[#444] text-sm">
                                            <span className="truncate text-gray-600 dark:text-gray-300 max-w-[200px]">{url}</span>
                                            <button type="button" onClick={() => removeImageUrl(idx)} className="text-gray-400 hover:text-black dark:hover:text-white"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Download URL */}
                            {formData.category === 'app' && (
                                <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Smartphone size={16} className="text-gray-400" /> APK / Download
                                    </label>
                                    <div className="space-y-2">
                                        <div className="relative w-full">
                                            <input
                                                type="file"
                                                accept=".apk"
                                                id="apk-upload"
                                                className="hidden"
                                                onChange={(e) => {
                                                    setApkFile(e.target.files[0]);
                                                    setFormData({ ...formData, downloadUrl: '' });
                                                }}
                                            />
                                            <label htmlFor="apk-upload" className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-300 dark:border-[#444] rounded-lg py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] cursor-pointer transition-colors">
                                                <Upload size={14} /> {apkFile ? apkFile.name : 'Upload .apk File'}
                                            </label>
                                        </div>
                                        <div className="flex gap-2 w-full">
                                            <input
                                                type="text"
                                                className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-black/50 dark:border-white/50 text-gray-900 dark:text-white"
                                                placeholder="Or paste Direct Download URL..."
                                                value={formData.downloadUrl || ''}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, downloadUrl: e.target.value });
                                                    setApkFile(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.category === 'website' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none"
                                        placeholder="https://mysite.com"
                                        value={formData.projectUrl}
                                        onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                                    />
                                </div>
                            )}

                            {formData.category === 'github' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub Repository URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none"
                                        placeholder="https://github.com/username/repo"
                                        value={formData.githubUrl || ''}
                                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                {editingProjectId && (
                                    <button
                                        type="button"
                                        onClick={onCancelEdit}
                                        className="flex-1 py-2.5 border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-3d py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:border-b-[4px] disabled:transform-none"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
                                        </div>
                                    ) : (
                                        editingProjectId ? (
                                            <><Pencil size={18} /> Update Project</>
                                        ) : (
                                            <><Plus size={18} /> Create Project</>
                                        )
                                    )}
                                </button>
                            </div>

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
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Projects</h2>
                        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{projects.length} Total</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {fetching ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="animate-spin text-black dark:text-white" size={32} />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <p>No projects yet. Create one to get started.</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={projects.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {projects.map(project => (
                                            <SortableProjectItem
                                                key={project.id}
                                                project={project}
                                                onToggleFeatured={handleToggleFeatured}
                                                onDelete={handleDelete}
                                                onEdit={onEdit}
                                                onImageClick={(p) => {
                                                    if (p.imageUrl || (p.imageUrls && p.imageUrls.length > 0)) {
                                                        const images = [p.imageUrl, ...(p.imageUrls || [])].filter(Boolean);
                                                        const uniqueImages = [...new Set(images)];
                                                        setCurrentLightboxImages(uniqueImages);
                                                        setCurrentLightboxIndex(0);
                                                        setLightboxOpen(true);
                                                    } else {
                                                        alert("No image available to preview.");
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

export default ProjectsTab;
