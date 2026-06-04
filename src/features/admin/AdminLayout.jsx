import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

import ImageLightbox from '../../components/ui/ImageLightbox';
import AdminSidebar from './components/AdminSidebar';
import DashboardTab from './components/DashboardTab';
import ProjectsTab from './components/ProjectsTab';
import MessagesTab from './components/MessagesTab';
import ProfileTab from './components/ProfileTab';
import AiConfigTab from './components/AiConfigTab';
import ExperienceTab from './components/ExperienceTab';
import CertificationsTab from './components/CertificationsTab';
import AchievementsTab from './components/AchievementsTab';
import SkillsTab from './components/SkillsTab';

const AdminLayout = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [projects, setProjects] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [skills, setSkills] = useState([]);
    const [activeTab, setActiveTab] = useState('projects');

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // AI Settings State
    const [aiConfig, setAiConfig] = useState({ geminiApiKey: '', resumeContext: '' });

    // Profile Settings State
    const [profileData, setProfileData] = useState({
        name: 'Aditya Raj', tagline: 'A Tech Explorer & Full Stack Developer',
        avatarUrl: '', resumeUrl: '', githubUrl: '', linkedinUrl: '', email: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [savingSettings, setSavingSettings] = useState(false);

    // Form State (Projects)
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'app', projectUrl: '', githubUrl: '', techStack: '',
    });
    const [editingProjectId, setEditingProjectId] = useState(null);

    // Form State (Generic Items like Experience/Certifications/Achievements)
    const [genericFormData, setGenericFormData] = useState({
        title: '', organization: '', duration: '', description: '', linkUrl: '', allowDownload: false
    });

    // Image & File Handling
    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [projectImageFiles, setProjectImageFiles] = useState([]);
    const [apkFile, setApkFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);

    const [visitorStats, setVisitorStats] = useState([]);
    const [totalVisits, setTotalVisits] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [messages, setMessages] = useState([]);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentLightboxImages, setCurrentLightboxImages] = useState([]);
    const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
        fetchExperiences();
        fetchCertifications();
        fetchAchievements();
        fetchSkills();
        fetchAiSettings();
        fetchProfileSettings();
        fetchStats();
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        } catch (error) { console.error("Error fetching messages:", error); }
    };

    const markMessageRead = async (id) => {
        try {
            await updateDoc(doc(db, "messages", id), { read: true });
            setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
        } catch (error) { console.error("Error marking message read:", error); }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteDoc(doc(db, "messages", id));
            setMessages(messages.filter(m => m.id !== id));
        } catch (error) { console.error("Error deleting message:", error); }
    };

    const fetchStats = async () => {
        try {
            const totalRef = doc(db, "stats", "visitors");
            const totalSnap = await getDoc(totalRef);
            if (totalSnap.exists()) setTotalVisits(totalSnap.data().totalVisits || 0);

            const dailyRef = collection(db, "stats", "visits", "daily");
            const q = query(dailyRef, orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const stats = querySnapshot.docs.map(doc => ({
                date: doc.data().date.slice(5), count: doc.data().count
            })).reverse().slice(-7);
            setVisitorStats(stats);
        } catch (error) { console.error("Error fetching stats:", error); }
    };

    const fetchProjects = async () => {
        try {
            const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            projectsData.sort((a, b) => (a.order !== undefined ? a.order : 9999) - (b.order !== undefined ? b.order : 9999));
            setProjects(projectsData);
        } catch (error) { console.error("Error fetching projects: ", error); } finally { setFetching(false); }
    };

    const fetchExperiences = async () => {
        try {
            const q = query(collection(db, "experiences"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (a.order !== undefined ? a.order : 9999) - (b.order !== undefined ? b.order : 9999));
            setExperiences(data);
        } catch (error) { console.error("Error fetching experiences: ", error); }
    };

    const fetchCertifications = async () => {
        try {
            const q = query(collection(db, "certifications"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (a.order !== undefined ? a.order : 9999) - (b.order !== undefined ? b.order : 9999));
            setCertifications(data);
        } catch (error) { console.error("Error fetching certifications: ", error); }
    };

    const fetchAchievements = async () => {
        try {
            const q = query(collection(db, "achievements"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (a.order !== undefined ? a.order : 9999) - (b.order !== undefined ? b.order : 9999));
            setAchievements(data);
        } catch (error) { console.error("Error fetching achievements: ", error); }
    };

    const fetchAiSettings = async () => {
        try {
            const docRef = doc(db, "settings", "config");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setAiConfig(docSnap.data());
        } catch (error) { console.error("Error fetching AI settings:", error); }
    };

    const fetchProfileSettings = async () => {
        try {
            const docRef = doc(db, "settings", "profile");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setProfileData(prev => ({ ...prev, ...docSnap.data() }));
        } catch (error) { console.error("Error fetching profile settings:", error); }
    };

    const fetchSkills = async () => {
        try {
            const q = query(collection(db, "skills"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSkills(data);
        } catch (error) { console.error("Error fetching skills:", error); }
    };

    const addSkill = async (skillData) => {
        setSavingSettings(true);
        try {
            await addDoc(collection(db, "skills"), {
                ...skillData,
                createdAt: new Date().toISOString()
            });
            await fetchSkills();
        } catch (error) { console.error("Error adding skill:", error); }
        finally { setSavingSettings(false); }
    };

    const deleteSkill = async (id) => {
        try {
            await deleteDoc(doc(db, "skills", id));
            setSkills(prev => prev.filter(s => s.id !== id));
        } catch (error) { console.error("Error deleting skill:", error); }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleToggleFeatured = async (project) => {
        try {
            const projectRef = doc(db, "projects", project.id);
            await updateDoc(projectRef, { featured: !project.featured });
            fetchProjects();
        } catch (error) { console.error("Error toggling featured status:", error); }
    };

    const handleDelete = async (project) => {
        if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) return;
        try {
            const deleteIfFirebaseUrl = async (url) => {
                if (url && url.includes('firebasestorage.googleapis.com')) {
                    try { await deleteObject(ref(storage, url)); } catch { console.warn('File not found in storage or already deleted:', url); }
                }
            };
            await deleteIfFirebaseUrl(project.imageUrl);
            await deleteIfFirebaseUrl(project.downloadUrl);
            if (project.imageUrls && Array.isArray(project.imageUrls)) {
                for (const url of project.imageUrls) await deleteIfFirebaseUrl(url);
            }
            await deleteDoc(doc(db, "projects", project.id));
            alert("Project and associated files deleted!");
            fetchProjects();
        } catch (error) { console.error("Error deleting project:", error); alert("Failed to delete project completely."); }
    };

    const handleGenericDelete = async (item, collectionName) => {
        if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
        try {
            if (item.imageUrl && item.imageUrl.includes('firebasestorage.googleapis.com')) {
                try { await deleteObject(ref(storage, item.imageUrl)); } catch { console.warn('Image not found in storage:', item.imageUrl); }
            }
            await deleteDoc(doc(db, collectionName, item.id));
            if (collectionName === 'experiences') fetchExperiences();
            if (collectionName === 'certifications') fetchCertifications();
            if (collectionName === 'achievements') fetchAchievements();
        } catch (error) { console.error(`Error deleting item from ${collectionName}:`, error); }
    };

    const handleAddImageUrl = () => {
        if (currentImageUrl.trim()) {
            setImageUrls([...imageUrls, currentImageUrl.trim()]);
            setCurrentImageUrl('');
        }
    };

    const removeImageUrl = (index) => setImageUrls(imageUrls.filter((_, i) => i !== index));

    const handleEditStart = (project) => {
        setEditingProjectId(project.id);
        setFormData({
            title: project.title || '',
            description: project.description || '',
            category: project.category || 'app',
            projectUrl: project.projectUrl || '',
            githubUrl: project.githubUrl || '',
            techStack: project.techStack || '',
            downloadUrl: project.downloadUrl || ''
        });
        setImageUrls(project.imageUrls || (project.imageUrl ? [project.imageUrl] : []));
        setProjectImageFiles([]);
        setApkFile(null);
    };

    const handleEditCancel = () => {
        setEditingProjectId(null);
        setFormData({ title: '', description: '', category: 'app', projectUrl: '', githubUrl: '', techStack: '' });
        setImageUrls([]);
        setProjectImageFiles([]);
        setApkFile(null);
    };

    const handleSaveAiSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await setDoc(doc(db, "settings", "config"), aiConfig);
            alert("AI Settings Saved! The chatbot will now use this context.");
        } catch (error) { console.error("Error saving AI settings:", error); alert("Failed to save settings: " + error.message); } finally { setSavingSettings(false); }
    };

    const normalizeUrl = (url) => {
        if (!url) return '';
        let cleanUrl = url.trim();
        if (!cleanUrl.match(/^https?:\/\//)) return `https://${cleanUrl}`;
        return cleanUrl;
    };

    const handleSaveProfileSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const deleteIfFirebaseUrl = async (url) => {
                if (url && url.includes('firebasestorage.googleapis.com')) {
                    try { await deleteObject(ref(storage, url)); } catch { console.warn('File not found in storage or already deleted:', url); }
                }
            };

            let updatedProfile = { ...profileData, githubUrl: normalizeUrl(profileData.githubUrl), linkedinUrl: normalizeUrl(profileData.linkedinUrl) };

            if (avatarFile) {
                await deleteIfFirebaseUrl(profileData.avatarUrl);
                const snapshot = await uploadBytes(ref(storage, `profile_pictures/${Date.now()}_${avatarFile.name}`), avatarFile);
                updatedProfile.avatarUrl = await getDownloadURL(snapshot.ref);
            }

            if (resumeFile) {
                await deleteIfFirebaseUrl(profileData.resumeUrl);
                const snapshot = await uploadBytes(ref(storage, `resumes/${Date.now()}_${resumeFile.name}`), resumeFile);
                updatedProfile.resumeUrl = await getDownloadURL(snapshot.ref);
            }

            await setDoc(doc(db, "settings", "profile"), updatedProfile);
            setProfileData(updatedProfile);
            setResumeFile(null); setAvatarFile(null);
            alert("Profile Updated! Homepage will reflect changes immediately.");
        } catch (error) { console.error("Error saving profile:", error); alert("Failed to save profile: " + error.message); } finally { setSavingSettings(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalImageUrls = [...imageUrls];
            const uploadFile = (file, path) => {
                return new Promise((resolve, reject) => {
                    const storageRef = ref(storage, path);
                    const uploadTask = uploadBytesResumable(storageRef, file);
                    uploadTask.on('state_changed',
                        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                        (error) => { console.error("Upload error:", error); reject(error); },
                        async () => {
                            try {
                                const url = await getDownloadURL(storageRef);
                                resolve(url);
                            } catch (err) {
                                reject(err);
                            }
                        }
                    );
                });
            };

            if (projectImageFiles && projectImageFiles.length > 0) {
                for (let i = 0; i < projectImageFiles.length; i++) {
                    const file = projectImageFiles[i];
                    try {
                        const fileUrl = await uploadFile(file, `images/${Date.now()}_${i}_${file.name}`);
                        finalImageUrls.push(fileUrl);
                    } catch (err) {
                        console.error(`Image upload failed for ${file.name}:`, err);
                        alert(`Failed to upload image: ${file.name}`);
                    }
                }
            }

            let downloadUrl = normalizeUrl(formData.downloadUrl || '');
            if (formData.category === 'app' && apkFile) {
                try { downloadUrl = await uploadFile(apkFile, `apks/${Date.now()}_${apkFile.name}`); } catch (err) { console.error("APK upload failed:", err); alert("APK upload failed. Check Storage rules."); }
            }

            if (editingProjectId) {
                const projectRef = doc(db, "projects", editingProjectId);
                const existingProj = projects.find(p => p.id === editingProjectId);
                const orderVal = existingProj && existingProj.order !== undefined ? existingProj.order : projects.length;
                const createdVal = existingProj && existingProj.createdAt ? existingProj.createdAt : Date.now();
                const featuredVal = existingProj && existingProj.featured ? existingProj.featured : false;

                await setDoc(projectRef, {
                    ...formData,
                    projectUrl: normalizeUrl(formData.projectUrl),
                    githubUrl: normalizeUrl(formData.githubUrl),
                    imageUrl: finalImageUrls[0] || '',
                    imageUrls: finalImageUrls,
                    downloadUrl,
                    createdAt: createdVal,
                    order: orderVal,
                    featured: featuredVal
                });

                alert("Project updated successfully!");
                setEditingProjectId(null);
            } else {
                await addDoc(collection(db, "projects"), {
                    ...formData, 
                    projectUrl: normalizeUrl(formData.projectUrl), 
                    githubUrl: normalizeUrl(formData.githubUrl),
                    imageUrl: finalImageUrls[0] || '', imageUrls: finalImageUrls, downloadUrl,
                    createdAt: Date.now(), order: projects.length,
                    featured: false
                });
                alert("Project added successfully!");
            }

            setFormData({ title: '', description: '', category: 'app', projectUrl: '', githubUrl: '', techStack: '' });
            setImageUrls([]); setCurrentImageUrl(''); setImageFile(null); setProjectImageFiles([]); setApkFile(null);
            fetchProjects();
        } catch (error) { console.error("Error submitting project: ", error); alert("Error saving project: " + error.message); } finally { setLoading(false); setUploadProgress(0); }
    };

    const handleGenericSubmit = async (e, collectionName) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalImageUrl = '';
            let fileType = null;
            if (imageFile) {
                fileType = imageFile.type === 'application/pdf' ? 'pdf' : 'image';
                // Capture the ref BEFORE starting upload to avoid snapshot.ref being undefined
                const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);
                finalImageUrl = await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                        (error) => { console.error("Upload error:", error); reject(error); },
                        async () => {
                            try {
                                const url = await getDownloadURL(storageRef);
                                resolve(url);
                            } catch (err) {
                                reject(err);
                            }
                        }
                    );
                });
            }

            let itemsLength = experiences.length;
            if (collectionName === 'certifications') itemsLength = certifications.length;
            if (collectionName === 'achievements') itemsLength = achievements.length;

            await addDoc(collection(db, collectionName), {
                ...genericFormData, 
                linkUrl: normalizeUrl(genericFormData.linkUrl),
                imageUrl: finalImageUrl, fileType,
                createdAt: Date.now(), order: itemsLength
            });

            alert("Item added successfully!");
            setGenericFormData({ title: '', organization: '', duration: '', description: '', linkUrl: '', allowDownload: false });
            setImageFile(null);
            if (collectionName === 'experiences') fetchExperiences();
            if (collectionName === 'certifications') fetchCertifications();
            if (collectionName === 'achievements') fetchAchievements();
        } catch (error) { console.error(`Error adding to ${collectionName}:`, error); alert("Error adding item: " + error.message); } finally { setLoading(false); setUploadProgress(0); }
    };

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setProjects((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            saveOrder(newItems, 'projects');
            return newItems;
        });
    };

    const handleGenericDragEnd = async (event, collectionName) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            let setItems = setExperiences;
            if (collectionName === 'certifications') setItems = setCertifications;
            if (collectionName === 'achievements') setItems = setAchievements;
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                saveOrder(newItems, collectionName);
                return newItems;
            });
        }
    };

    const saveOrder = async (newItems, collectionName) => {
        try {
            const updates = newItems.map((item, index) => updateDoc(doc(db, collectionName, item.id), { order: index }));
            await Promise.all(updates);
        } catch (error) { console.error("Error saving order:", error); }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans transition-colors duration-300">
            <AdminSidebar
                activeTab={activeTab} setActiveTab={setActiveTab}
                messages={messages} darkMode={darkMode}
                setDarkMode={setDarkMode} handleLogout={handleLogout}
            />

            <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8 min-h-screen">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-glossy">
                            {activeTab === 'dashboard' && 'Dashboard Overview'}
                            {activeTab === 'projects' && 'Project Management'}
                            {activeTab === 'experiences' && 'Experience Management'}
                            {activeTab === 'certifications' && 'Certifications Management'}
                            {activeTab === 'achievements' && 'Achievements Management'}
                            {activeTab === 'skills' && 'Skills & Technologies'}
                            {activeTab === 'profile' && 'Profile Settings'}
                            {activeTab === 'messages' && 'Visitor Messages'}
                            {activeTab === 'ai' && 'AI Configuration'}
                        </h1>
                        <p className="text-black/80 dark:text-gray-300 text-sm mt-1">Manage your portfolio content and settings.</p>
                    </div>
                </header>

                {activeTab === 'dashboard' && <DashboardTab totalVisits={totalVisits} visitorStats={visitorStats} />}
                {activeTab === 'messages' && <MessagesTab messages={messages} deleteMessage={deleteMessage} markMessageRead={markMessageRead} />}
                {activeTab === 'projects' &&
                    <ProjectsTab
                        formData={formData} setFormData={setFormData} handleSubmit={handleSubmit}
                        loading={loading} uploadProgress={uploadProgress}
                        projectImageFiles={projectImageFiles} setProjectImageFiles={setProjectImageFiles}
                        currentImageUrl={currentImageUrl} setCurrentImageUrl={setCurrentImageUrl}
                        handleAddImageUrl={handleAddImageUrl} imageUrls={imageUrls} removeImageUrl={removeImageUrl}
                        apkFile={apkFile} setApkFile={setApkFile}
                        fetching={fetching} projects={projects}
                        sensors={sensors} handleDragEnd={handleDragEnd}
                        handleToggleFeatured={handleToggleFeatured} handleDelete={handleDelete}
                        setCurrentLightboxImages={setCurrentLightboxImages} setCurrentLightboxIndex={setCurrentLightboxIndex} setLightboxOpen={setLightboxOpen}
                        editingProjectId={editingProjectId} onCancelEdit={handleEditCancel} onEdit={handleEditStart}
                    />
                }
                {activeTab === 'experiences' &&
                    <ExperienceTab
                        formData={genericFormData} setFormData={setGenericFormData} handleSubmit={handleGenericSubmit}
                        loading={loading} uploadProgress={uploadProgress}
                        imageFile={imageFile} setImageFile={setImageFile}
                        fetching={fetching} items={experiences}
                        sensors={sensors} handleDragEnd={handleGenericDragEnd}
                        handleDelete={handleGenericDelete}
                        setCurrentLightboxImages={setCurrentLightboxImages} setCurrentLightboxIndex={setCurrentLightboxIndex} setLightboxOpen={setLightboxOpen}
                    />
                }
                {activeTab === 'certifications' &&
                    <CertificationsTab
                        formData={genericFormData} setFormData={setGenericFormData} handleSubmit={handleGenericSubmit}
                        loading={loading} uploadProgress={uploadProgress}
                        imageFile={imageFile} setImageFile={setImageFile}
                        fetching={fetching} items={certifications}
                        sensors={sensors} handleDragEnd={handleGenericDragEnd}
                        handleDelete={handleGenericDelete}
                        setCurrentLightboxImages={setCurrentLightboxImages} setCurrentLightboxIndex={setCurrentLightboxIndex} setLightboxOpen={setLightboxOpen}
                    />
                }
                {activeTab === 'achievements' &&
                    <AchievementsTab
                        formData={genericFormData} setFormData={setGenericFormData} handleSubmit={handleGenericSubmit}
                        loading={loading} uploadProgress={uploadProgress}
                        imageFile={imageFile} setImageFile={setImageFile}
                        fetching={fetching} items={achievements}
                        sensors={sensors} handleDragEnd={handleGenericDragEnd}
                        handleDelete={handleGenericDelete}
                        setCurrentLightboxImages={setCurrentLightboxImages} setCurrentLightboxIndex={setCurrentLightboxIndex} setLightboxOpen={setLightboxOpen}
                    />
                }
                {activeTab === 'profile' &&
                    <ProfileTab
                        profileData={profileData} setProfileData={setProfileData} handleSaveProfileSettings={handleSaveProfileSettings}
                        savingSettings={savingSettings} avatarFile={avatarFile} setAvatarFile={setAvatarFile}
                        resumeFile={resumeFile} setResumeFile={setResumeFile}
                    />
                }
                {activeTab === 'ai' &&
                    <AiConfigTab aiConfig={aiConfig} setAiConfig={setAiConfig} handleSaveAiSettings={handleSaveAiSettings} savingSettings={savingSettings} />
                }
                {activeTab === 'skills' &&
                    <SkillsTab skills={skills} onAdd={addSkill} onDelete={deleteSkill} saving={savingSettings} />
                }
            </main>

            <ImageLightbox isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} images={currentLightboxImages} initialIndex={currentLightboxIndex} />
        </div>
    );
};

export default AdminLayout;
