import React, { useState, useEffect } from 'react';
import { Upload, Plus, Save, Loader2, Image as ImageIcon, Smartphone, Trash2, X, Settings, Key, FileText, User, Github, Linkedin, Mail, MessageCircle, Star, LayoutDashboard, PieChart, LogOut, Briefcase, Moon, Sun } from 'lucide-react';
import { db, storage, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';

const SortableProjectItem = ({ project, onToggleFeatured, onDelete, onImageClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="glass-panel text-black dark:text-gray-300 p-4 rounded-xl transition-all group flex gap-4 items-center"
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <GripVertical size={20} />
            </div>

            <div
                className="h-16 w-16 bg-gray-100 dark:bg-[#333] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-[#444] cursor-zoom-in"
                onClick={() => onImageClick(project)}
            >
                {project.imageUrl ? (
                    <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={20} />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-black dark:text-white truncate">{project.title}</h3>
                <p className="text-sm text-black/80 dark:text-gray-300 line-clamp-1 mb-2">{project.description}</p>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-300 text-[10px] font-medium uppercase tracking-wider rounded border border-gray-200 dark:border-[#444]">
                        {project.category}
                    </span>
                    {project.featured && (
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/10 text-black dark:text-white text-[10px] font-medium uppercase tracking-wider rounded border border-black/20 dark:border-white/20 flex items-center gap-1">
                            <Star size={8} fill="currentColor" /> Featured
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onToggleFeatured(project)}
                    className={`p-2 rounded-lg transition-colors ${project.featured ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white' : 'text-gray-400 hover:bg-black/5 hover:text-black dark:hover:bg-white/5 dark:hover:text-white'}`}
                    title={project.featured ? "Unfeature" : "Spotlight this project"}
                >
                    <Star size={18} fill={project.featured ? "currentColor" : "none"} />
                </button>
                <button
                    onClick={() => onDelete(project)}
                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete Project"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

const Admin = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'profile', 'ai'

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
    const [aiConfig, setAiConfig] = useState({
        geminiApiKey: '',
        resumeContext: ''
    });

    // Profile Settings State
    const [profileData, setProfileData] = useState({
        name: 'Aditya Raj',
        tagline: 'A Tech Explorer & Full Stack Developer',
        avatarUrl: '',
        resumeUrl: '',
        githubUrl: '',
        linkedinUrl: '',
        email: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);

    const [savingSettings, setSavingSettings] = useState(false);

    // Form State (Projects)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'app',
        projectUrl: '',
        githubUrl: '',
    });

    // Image Handling
    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const [apkFile, setApkFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null); // For Profile tab


    const [visitorStats, setVisitorStats] = useState([]);
    const [totalVisits, setTotalVisits] = useState(0);

    const [uploadProgress, setUploadProgress] = useState(0);

    // Messages State
    const [messages, setMessages] = useState([]);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentLightboxImages, setCurrentLightboxImages] = useState([]);
    const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);



    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
        fetchAiSettings();
        fetchProfileSettings();
        fetchStats();
        fetchStats();
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const markMessageRead = async (id) => {
        try {
            await updateDoc(doc(db, "messages", id), { read: true });
            setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
        } catch (error) {
            console.error("Error marking message read:", error);
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteDoc(doc(db, "messages", id));
            setMessages(messages.filter(m => m.id !== id));
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };



    const fetchStats = async () => {
        try {
            // 1. Get Total Visits
            const totalRef = doc(db, "stats", "visitors");
            const totalSnap = await getDoc(totalRef);
            if (totalSnap.exists()) {
                setTotalVisits(totalSnap.data().totalVisits || 0);
            }

            // 2. Get Daily Stats (Last 7 days)
            // Note: In a real app, query by date range. Here we fetch all and slice for simplicity or use a limit query.
            const dailyRef = collection(db, "stats", "visits", "daily");
            const q = query(dailyRef, orderBy("date", "desc")); // Get latest first
            const querySnapshot = await getDocs(q);

            const stats = querySnapshot.docs.map(doc => ({
                date: doc.data().date.slice(5), // Remove Year for display (MM-DD)
                count: doc.data().count
            })).reverse().slice(-7); // Keep last 7 days in chronological order

            setVisitorStats(stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchProjects = async () => {
        try {
            const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const projectsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by 'order' if exists, otherwise fallback (push to bottom)
            projectsData.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 9999;
                const orderB = b.order !== undefined ? b.order : 9999;
                return orderA - orderB;
            });

            setProjects(projectsData);
        } catch (error) {
            console.error("Error fetching projects: ", error);
        } finally {
            setFetching(false);
        }
    };

    const fetchAiSettings = async () => {
        try {
            const docRef = doc(db, "settings", "config");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setAiConfig(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching AI settings:", error);
        }
    };

    const fetchProfileSettings = async () => {
        try {
            const docRef = doc(db, "settings", "profile");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfileData({ ...profileData, ...docSnap.data() });
            }
        } catch (error) {
            console.error("Error fetching profile settings:", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleToggleFeatured = async (project) => {
        try {
            const projectRef = doc(db, "projects", project.id);
            await updateDoc(projectRef, {
                featured: !project.featured
            });
            fetchProjects();
        } catch (error) {
            console.error("Error toggling featured status:", error);
        }
    };

    const handleDelete = async (project) => {
        if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) return;

        try {
            // Helper to delete from storage if it's a Firebase URL
            const deleteIfFirebaseUrl = async (url) => {
                if (url && url.includes('firebasestorage.googleapis.com')) {
                    try {
                        const fileRef = ref(storage, url);
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.warn('File not found in storage or already deleted:', url);
                    }
                }
            };

            // Delete single image
            await deleteIfFirebaseUrl(project.imageUrl);

            // Delete APK / download URL
            await deleteIfFirebaseUrl(project.downloadUrl);

            // Delete array of images if they exist
            if (project.imageUrls && Array.isArray(project.imageUrls)) {
                for (const url of project.imageUrls) {
                    await deleteIfFirebaseUrl(url);
                }
            }

            await deleteDoc(doc(db, "projects", project.id));
            alert("Project and associated files deleted!");
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Failed to delete project completely.");
        }
    };

    const handleAddImageUrl = () => {
        if (currentImageUrl.trim()) {
            setImageUrls([...imageUrls, currentImageUrl.trim()]);
            setCurrentImageUrl('');
        }
    };

    const removeImageUrl = (index) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleSaveAiSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await setDoc(doc(db, "settings", "config"), aiConfig);
            alert("AI Settings Saved! The chatbot will now use this context.");
        } catch (error) {
            console.error("Error saving AI settings:", error);
            alert("Failed to save settings: " + error.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const normalizeUrl = (url) => {
        if (!url) return '';
        let cleanUrl = url.trim();
        // If it doesn't start with http:// or https://, add https://
        if (!cleanUrl.match(/^https?:\/\//)) {
            return `https://${cleanUrl}`;
        }
        return cleanUrl;
    };

    const handleSaveProfileSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            // Helper to delete from storage if it's a Firebase URL
            const deleteIfFirebaseUrl = async (url) => {
                if (url && url.includes('firebasestorage.googleapis.com')) {
                    try {
                        const fileRef = ref(storage, url);
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.warn('File not found in storage or already deleted:', url);
                    }
                }
            };

            let updatedProfile = {
                ...profileData,
                githubUrl: normalizeUrl(profileData.githubUrl),
                linkedinUrl: normalizeUrl(profileData.linkedinUrl)
            };

            // Upload Avatar if selected
            if (avatarFile) {
                // Delete old avatar first
                await deleteIfFirebaseUrl(profileData.avatarUrl);

                const avatarRef = ref(storage, `profile_pictures/${Date.now()}_${avatarFile.name}`);
                const snapshot = await uploadBytes(avatarRef, avatarFile);
                const url = await getDownloadURL(snapshot.ref);
                updatedProfile.avatarUrl = url;
            }

            // Upload Resume if selected
            if (resumeFile) {
                // Delete old resume first
                await deleteIfFirebaseUrl(profileData.resumeUrl);

                const resumeRef = ref(storage, `resumes/${Date.now()}_${resumeFile.name}`);
                const snapshot = await uploadBytes(resumeRef, resumeFile);
                const url = await getDownloadURL(snapshot.ref);
                updatedProfile.resumeUrl = url;
            }

            await setDoc(doc(db, "settings", "profile"), updatedProfile);
            setProfileData(updatedProfile);
            setResumeFile(null);
            setAvatarFile(null);
            alert("Profile Updated! Homepage will reflect changes immediately.");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile: " + error.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const finalImageUrls = [...imageUrls];

            // Helper for Resumable Upload
            const uploadFile = (file, path) => {
                return new Promise((resolve, reject) => {
                    const storageRef = ref(storage, path);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                            console.log('Upload is ' + progress + '% done');
                        },
                        (error) => {
                            console.error("Upload error:", error);
                            reject(error);
                        },
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                resolve(downloadURL);
                            });
                        }
                    );
                });
            };

            // 1. Upload File if present
            if (imageFile) {
                try {
                    const fileUrl = await uploadFile(imageFile, `images/${Date.now()}_${imageFile.name}`);
                    finalImageUrls.unshift(fileUrl);
                } catch (err) {
                    console.error("Image upload failed:", err);
                    alert("Image upload failed (but continuing).");
                }
            }

            // 2. Upload APK (if App)
            let downloadUrl = formData.downloadUrl || '';
            if (formData.category === 'app' && apkFile) {
                try {
                    downloadUrl = await uploadFile(apkFile, `apks/${Date.now()}_${apkFile.name}`);
                } catch (err) {
                    console.error("APK upload failed:", err);
                    alert("APK upload failed. Check Storage rules.");
                }
            }

            // 3. Save to Firestore
            await addDoc(collection(db, "projects"), {
                ...formData,
                imageUrl: finalImageUrls[0] || '',
                imageUrls: finalImageUrls,
                downloadUrl,
                createdAt: Date.now(),
                order: projects.length // Default to end
            });

            alert("Project added successfully!");

            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'app',
                projectUrl: '',
                githubUrl: '',
            });
            setImageUrls([]);
            setCurrentImageUrl('');
            setImageFile(null);
            setApkFile(null);
            fetchProjects();

        } catch (error) {
            console.error("Error adding project: ", error);
            alert("Error adding project: " + error.message);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setProjects((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Save the new order to Firestore
                saveOrder(newItems);

                return newItems;
            });
        }
    };

    const saveOrder = async (newItems) => {
        try {
            // Batch update or Promise.all
            // Since we don't have batch handy (imported implicitly via db if needed, but simple Promise.all is fine for <100 items)
            const updates = newItems.map((item, index) => {
                const projectRef = doc(db, "projects", item.id);
                return updateDoc(projectRef, { order: index });
            });
            await Promise.all(updates);
            console.log('Order updated');
        } catch (error) {
            console.error("Error saving order:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans transition-colors duration-300">
            {/* Sidebar Navigation */}
            <aside className="w-64 glass-panel border-r border-[#e5e7eb] dark:border-white/10 hidden md:flex flex-col fixed h-full z-10 transition-colors duration-300">
                <div className="p-6 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2 text-glossy font-bold text-xl tracking-tight">
                        <LayoutDashboard size={24} />
                        <span className="font-heading">DevConsole</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                    >
                        <PieChart size={18} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                    >
                        <Briefcase size={18} />
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                    >
                        <MessageCircle size={18} />
                        Messages
                        {messages.filter(m => !m.read).length > 0 && (
                            <span className="ml-auto bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {messages.filter(m => !m.read).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                    >
                        <User size={18} />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                    >
                        <Settings size={18} />
                        AI Config
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-[#333] space-y-2">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222] rounded-lg transition-colors"
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8 min-h-screen">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-glossy">
                            {activeTab === 'dashboard' && 'Dashboard Overview'}
                            {activeTab === 'projects' && 'Project Management'}
                            {activeTab === 'profile' && 'Profile Settings'}
                            {activeTab === 'messages' && 'Visitor Messages'}
                            {activeTab === 'ai' && 'AI Configuration'}
                        </h1>
                        <p className="text-black/80 dark:text-gray-300 text-sm mt-1">Manage your portfolio content and settings.</p>
                    </div>
                    {/* Mobile Menu Button could go here but using existing mobile header logic if present, though current code doesn't show one explicitly except in my previous mental model. The viewed file didn't have mobile header code visible so I skip adding it if it wasn't there to replace. */}
                </header>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-panel text-black dark:text-white p-6 rounded-xl transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Visitors</h3>
                                    <span className="p-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg"><User size={20} /></span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-bold text-glossy font-heading">{totalVisits.toLocaleString()}</h2>
                                    <span className="text-black dark:text-white text-sm font-medium flex items-center gap-1">All Time</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 glass-panel text-black dark:text-white p-6 rounded-xl transition-colors">
                                <h3 className="text-glossy font-heading mb-6">Visitor Trends (Last 7 Days)</h3>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={visitorStats}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ color: '#111827' }}
                                                cursor={{ fill: '#f3f4f6' }}
                                            />
                                            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <div className="glass-panel text-black dark:text-white rounded-xl overflow-hidden transition-colors">
                        <div className="p-6 border-b border-black/10 dark:border-white/10">
                            <h2 className="text-lg font-semibold font-heading text-glossy">Inbox</h2>
                        </div>
                        <div className="divide-y divide-black/10 dark:divide-white/10">
                            {messages.length > 0 ? messages.map(msg => (
                                <div key={msg.id} className={`p-6 transition-colors ${msg.read ? 'bg-transparent' : 'bg-black/5 dark:bg-white/10'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className={`font-medium ${msg.read ? 'text-black dark:text-white' : 'text-black dark:text-white'} flex items-center gap-2`}>
                                                {msg.name}
                                                {!msg.read && <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>}
                                            </h3>
                                            <a href={`mailto:${msg.email}`} className="text-sm text-black/80 dark:text-gray-300 hover:text-black dark:hover:text-white">{msg.email}</a>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={() => deleteMessage(msg.id)}
                                                className="text-gray-400 hover:text-black dark:hover:text-white"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-black/80 dark:text-gray-300 text-sm mt-3 whitespace-pre-wrap">{msg.message}</p>
                                    {!msg.read && (
                                        <button
                                            onClick={() => markMessageRead(msg.id)}
                                            className="text-xs text-black dark:text-white mt-4 font-medium hover:underline"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            )) : (
                                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                    <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                                    <p>No messages yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Add Project Form */}
                        <div className="lg:col-span-1">
                            <div className="glass-panel text-black dark:text-gray-300 rounded-xl shadow-sm overflow-hidden transition-colors">
                                <div className="p-6 border-b border-black/10 dark:border-white/10">
                                    <h2 className="text-lg font-semibold font-heading text-glossy">Add New Project</h2>
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

                                        {/* Screenshots */}
                                        <div className="space-y-3 pt-4">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <ImageIcon size={16} className="text-gray-400" /> Screenshots
                                            </label>

                                            <div className="space-y-2">
                                                <div className="relative w-full">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        id="file-upload"
                                                        className="hidden"
                                                        onChange={(e) => setImageFile(e.target.files[0])}
                                                    />
                                                    <label htmlFor="file-upload" className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#111] border border-dashed border-gray-300 dark:border-[#444] rounded-lg py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] cursor-pointer transition-colors">
                                                        <Upload size={14} /> {imageFile ? 'Change File' : 'Upload Image File'}
                                                    </label>
                                                </div>
                                                <div className="flex gap-2 w-full">
                                                    <input
                                                        type="url"
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
                                                {imageFile && (
                                                    <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/10 dark:border-white/10 text-sm">
                                                        <span className="truncate text-black dark:text-white font-medium">{imageFile.name}</span>
                                                        <button type="button" onClick={() => setImageFile(null)} className="text-gray-400 hover:text-black dark:hover:text-white"><X size={14} /></button>
                                                    </div>
                                                )}
                                                {imageUrls.map((url, idx) => (
                                                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-[#222]/50 p-2 rounded-lg border border-gray-200 dark:border-[#444] text-sm">
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
                                                            type="url"
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
                                                    type="url"
                                                    className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none"
                                                    placeholder="https://mysite.com"
                                                    value={formData.projectUrl}
                                                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                                                />
                                            </div>
                                        )}

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
                                            ) : <><Plus size={18} /> Create Project</>}
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
                )
                }

                {/* Profile Tab */}
                {
                    activeTab === 'profile' && (
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
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files[0])} />
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
                                                        type="url"
                                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:ring-white outline-none text-sm"
                                                        placeholder="GitHub URL"
                                                        value={profileData.githubUrl}
                                                        onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Linkedin size={16} className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="url"
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
                        </div>
                    )
                }

                {/* AI Config Tab */}
                {
                    activeTab === 'ai' && (
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
                    )
                }
            </main >

            {/* Admin Lightbox */}
            <ImageLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={currentLightboxImages}
                initialIndex={currentLightboxIndex}
            />
        </div >
    );
};

export default Admin;
