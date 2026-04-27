import React, { useState } from 'react';
import { Upload, User, Github, Linkedin, FileText, Save, Loader2 } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';

const ProfileTab = ({
    profileData, setProfileData,
    handleSaveProfileSettings, savingSettings,
    avatarFile, setAvatarFile,
    resumeFile, setResumeFile
}) => {
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);

    const onFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setTempImageSrc(reader.result);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
            // reset input
            e.target.value = null;
        }
    };

    const handleCropComplete = (croppedFile) => {
        setAvatarFile(croppedFile);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-200 dark:border-[#333] overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-[#333] bg-gray-50/50 dark:bg-[#222]/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your public profile details.</p>
                </div>
                <div className="p-8">
                    <form onSubmit={handleSaveProfileSettings} className="space-y-6">
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-[#444] shadow-md">
                                    {profileData.avatarUrl || avatarFile ? (
                                        <img
                                            src={avatarFile ? URL.createObjectURL(avatarFile) : profileData.avatarUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-full cursor-pointer shadow-lg hover:opacity-80 transition-colors">
                                    <Upload size={14} />
                                    <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Profile Picture</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Public)</label>
                                <input
                                    type="email"
                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tagline</label>
                            <input
                                type="text"
                                className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none"
                                value={profileData.tagline}
                                onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#333]">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Links & Resume</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Github size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none text-sm"
                                        placeholder="GitHub URL"
                                        value={profileData.githubUrl}
                                        onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Linkedin size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none text-sm"
                                        placeholder="LinkedIn URL"
                                        value={profileData.linkedinUrl}
                                        onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-black dark:text-white">Resume PDF</p>
                                        <p className="text-xs text-black dark:text-white">
                                            {profileData.resumeUrl ? 'File uploaded' : 'No file uploaded'}
                                            {resumeFile && ' (New file selected)'}
                                        </p>
                                    </div>
                                </div>
                                <label className="px-3 py-1.5 bg-white dark:bg-[#141414] border border-black/20 dark:border-white/20 text-black dark:text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                    Upload New
                                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="btn-3d px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-70 disabled:border-b-[4px] disabled:transform-none"
                            >
                                {savingSettings ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ImageCropperModal 
                isOpen={isCropperOpen}
                imageSrc={tempImageSrc}
                onClose={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default ProfileTab;
