import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc, increment, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ProjectCard from './components/ProjectCard';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Chatbot from '../chatbot/Chatbot';
import ResumeModal from './components/ResumeModal';
import ParticleBackground from '../../components/ui/ParticleBackground';
import SkeletonCard from './components/SkeletonCard';
import SEO from '../../components/ui/SEO';
import ShareButton from '../../components/ui/ShareButton';
import AnimatedSection from '../../components/ui/AnimatedSection';
import Tilt from 'react-parallax-tilt';
import { Github, Linkedin, Mail, FileText, ChevronRight, ExternalLink, Star, Code2, Briefcase, Rocket, Sparkles, Loader2, FolderOpen, Award } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ImageLightbox from '../../components/ui/ImageLightbox';
import ScrollProgressBar from '../../components/ui/ScrollProgressBar';
import Navbar from '../../components/ui/Navbar';
import BackToTop from '../../components/ui/BackToTop';
import SecureViewerModal from '../../components/ui/SecureViewerModal';

const Home = ({ onReady }) => {
    const [projects, setProjects] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [featuredProject, setFeaturedProject] = useState(null);

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        name: 'Aditya Raj',
        tagline: 'A Tech Explorer & Full Stack Developer making useful things for the web and mobile.',
        resumeUrl: '',
        githubUrl: 'https://github.com/Aditya-raj11',
        linkedinUrl: 'https://www.linkedin.com/in/aditya-raj-3027302ba/',
        email: 'adityaraj110405@gmail.com'
    });

    // Control the Resume Modal
    const [isResumeOpen, setIsResumeOpen] = useState(false);
    const [isFeaturedLightboxOpen, setIsFeaturedLightboxOpen] = useState(false);
    const [secureViewerUrl, setSecureViewerUrl] = useState(null);

    // Contact Form State
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm.name || !contactForm.email || !contactForm.message) {
            setSubmitMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });
        try {
            await addDoc(collection(db, "messages"), {
                ...contactForm,
                createdAt: new Date().toISOString(),
                read: false
            });
            setSubmitMessage({ type: 'success', text: 'Message sent successfully! I will get back to you soon.' });
            setContactForm({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Error sending message: ", error);
            setSubmitMessage({ type: 'error', text: 'Failed to send message. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const chatbotRef = useRef(null);

    const handlePersonaClick = (type) => {
        let prompt = "";
        switch (type) {
            case 'recruiter':
                prompt = "Hi! I am a recruiter looking for a skilled Full Stack Developer. Can you show me your best professional projects and explain why I should hire you?";
                break;
            case 'developer':
                prompt = "Hey! I'm a developer too. I'm interested in your technical depth. Show me your most complex projects and explain the tech stack and architectural decisions.";
                break;
            case 'founder':
                prompt = "Hello! I'm a founder looking for someone to build an MVP. Do you have experience building complete products? Show me examples of launched apps.";
                break;
            default:
                prompt = "Tell me about your best work.";
        }
        chatbotRef.current?.openWithPrompt(prompt);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Projects
                const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const projectsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by 'order' if exists
                projectsData.sort((a, b) => {
                    const orderA = a.order !== undefined ? a.order : 9999;
                    const orderB = b.order !== undefined ? b.order : 9999;
                    return orderA - orderB;
                });

                setProjects(projectsData);

                // Find featured project (first one found)
                const featured = projectsData.find(p => p.featured);
                setFeaturedProject(featured || null);

                // Fetch Experiences
                const expQ = query(collection(db, "experiences"), orderBy("createdAt", "desc"));
                const expSnap = await getDocs(expQ);
                const expData = expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                expData.sort((a, b) => (a.order !== undefined ? a.order : 9999) - (b.order !== undefined ? b.order : 9999));
                setExperiences(expData);

                // Fetch Certifications
                const certQ = query(collection(db, "certifications"), orderBy("createdAt", "desc"));
                const certSnap = await getDocs(certQ);
                const certData = certSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                certData.sort((a, b) => (a.order !== undefined ? a.order : 9999) - (b.order !== undefined ? b.order : 9999));
                setCertifications(certData);

                // Fetch Achievements
                const achQ = query(collection(db, "achievements"), orderBy("createdAt", "desc"));
                const achSnap = await getDocs(achQ);
                const achData = achSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                achData.sort((a, b) => (a.order !== undefined ? a.order : 9999) - (b.order !== undefined ? b.order : 9999));
                setAchievements(achData);

                // 2. Fetch Profile
                const profileDoc = await getDoc(doc(db, "settings", "profile"));
                if (profileDoc.exists()) {
                    setProfile(prev => ({ ...prev, ...profileDoc.data() }));
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
                if (onReady) onReady(); // Signal loading screen that data is ready
            }
        };

        fetchData();

        // 3. Track Visits (Session-based)
        const trackVisit = async () => {
            const hasVisited = sessionStorage.getItem('hasVisited');
            if (!hasVisited) {
                try {
                    const statsRef = doc(db, "stats", "visitors");
                    const statsSnap = await getDoc(statsRef);

                    if (statsSnap.exists()) {
                        await updateDoc(statsRef, {
                            totalVisits: increment(1),
                            lastVisit: new Date().toISOString()
                        });
                    } else {
                        await setDoc(statsRef, {
                            totalVisits: 1,
                            lastVisit: new Date().toISOString()
                        });
                    }

                    // Also track daily stats for the graph
                    const today = new Date().toISOString().split('T')[0];
                    const dailyRef = doc(db, "stats", "visits", "daily", today);
                    const dailySnap = await getDoc(dailyRef);

                    if (dailySnap.exists()) {
                        await updateDoc(dailyRef, { count: increment(1) });
                    } else {
                        await setDoc(dailyRef, { date: today, count: 1 });
                    }

                    sessionStorage.setItem('hasVisited', 'true');
                } catch (e) {
                    console.error("Error tracking visit:", e);
                }
            }
        };

        // Only track in production or if not localhost (optional, mostly just tracking session)
        trackVisit();

    }, []);

    return (
        <div className="min-h-screen transition-colors duration-300 overflow-x-hidden">
            <ScrollProgressBar />
            <Navbar 
                profileName={profile.name} 
                showExperience={experiences.length > 0} 
                showCertifications={certifications.length > 0} 
                showAchievements={achievements.length > 0}
            />

            {/* 1. Interactive Background */}
            <ParticleBackground />

            <SEO
                title={`${profile.name} - Portfolio`}
                description={profile.tagline}
                image={profile.avatarUrl}
            />

            {/* Hero Section */}
            <header id="hero" className="max-w-7xl mx-auto px-6 py-12 md:py-24 relative">
                <div className="absolute top-6 right-6 z-50">
                    <ThemeToggle />
                </div>

                <AnimatedSection delay={0.1} className="max-w-4xl mt-12 relative z-10">
                    {/* Avatar + name row */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="relative">
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-black/10 dark:border-white/20 shadow-lg"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-white/10">
                                    {profile.name.charAt(0)}{profile.name.split(' ')[1]?.charAt(0)}
                                </div>
                            )}
                            {/* Online dot */}
                            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-black pulse-dot" />
                        </div>
                        <div className="flex flex-col">
                            <a href="/" className="font-heading text-2xl text-glossy hover:opacity-70 transition-opacity">{profile.name}</a>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 tracking-wide">● Open to opportunities</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-heading mb-6 tracking-tight leading-[1.08]">
                        <span className="text-black/40 dark:text-white/30">Hi, I'm</span><br />
                        <span className="text-gradient">{profile.name}</span>
                        <span className="text-black dark:text-white">.</span>
                    </h1>

                    <h2 className="text-xl md:text-2xl text-black/70 dark:text-gray-300 font-medium mb-6 max-w-2xl leading-relaxed">
                        {profile.tagline || "A Tech Explorer & Full Stack Developer making useful things for the web and mobile."}
                    </h2>

                    {/* Tech stack pills */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {['React', 'Firebase', 'Flutter', 'Node.js', 'TypeScript'].map(tech => (
                            <span key={tech} className="px-3 py-1 rounded-full text-xs font-semibold border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-black/70 dark:text-white/60 tracking-wide">
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-3">
                        {profile.resumeUrl && (
                            <button
                                onClick={() => setIsResumeOpen(true)}
                                className="px-7 py-3 btn-primary rounded-full flex items-center gap-2 z-20 text-sm"
                            >
                                <FileText size={16} /> View Resume
                            </button>
                        )}
                        {profile.githubUrl && (
                            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 btn-3d rounded-full flex items-center gap-2 z-20 text-sm">
                                <Github size={16} /> GitHub
                            </a>
                        )}
                        {profile.linkedinUrl && (
                            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 btn-3d rounded-full flex items-center gap-2 z-20 text-sm">
                                <Linkedin size={16} /> LinkedIn
                            </a>
                        )}
                        <a href={`mailto:${profile.email}`} className="px-6 py-3 btn-3d rounded-full flex items-center gap-2 z-20 text-sm">
                            <Mail size={16} /> Email
                        </a>
                        <ShareButton title={`${profile.name} - Portfolio`} text={profile.tagline} />
                    </div>

                    {/* AI Recommender Widget */}
                    <div className="mt-16 p-6 md:p-8 rounded-3xl relative backdrop-blur-xl overflow-hidden bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100/50 dark:border-indigo-500/20 shadow-[0_8px_32px_rgba(99,102,241,0.08)] transition-all hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] group">
                        {/* Animated gradient shine */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 dark:to-white/5 opacity-40 group-hover:animate-[shimmer_1.5s_infinite]" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
                            <div>
                                <h3 className="text-xl font-heading font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2 tracking-tight">
                                    <Sparkles size={20} className="text-indigo-500 animate-pulse" />
                                    Ask the AI Assistant
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium max-w-sm">Not sure where to start? Select your persona and let the AI guide you through the portfolio.</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 shrink-0">
                                <button
                                    onClick={() => handlePersonaClick('recruiter')}
                                    className="px-5 py-2.5 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-indigo-100 dark:border-indigo-500/30 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/30 dark:hover:text-white dark:hover:border-indigo-400/50 transition-all flex items-center gap-2 shadow-sm hover:scale-105"
                                >
                                    <Briefcase size={16} /> Recruiter
                                </button>
                                <button
                                    onClick={() => handlePersonaClick('developer')}
                                    className="px-5 py-2.5 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-purple-100 dark:border-purple-500/30 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/30 dark:hover:text-white dark:hover:border-purple-400/50 transition-all flex items-center gap-2 shadow-sm hover:scale-105"
                                >
                                    <Code2 size={16} /> Developer
                                </button>
                                <button
                                    onClick={() => handlePersonaClick('founder')}
                                    className="px-5 py-2.5 bg-white/80 dark:bg-black/50 backdrop-blur-md border border-blue-100 dark:border-blue-500/30 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/30 dark:hover:text-white dark:hover:border-blue-400/50 transition-all flex items-center gap-2 shadow-sm hover:scale-105"
                                >
                                    <Rocket size={16} /> Founder
                                </button>
                            </div>
                        </div>
                    </div>

                </AnimatedSection>
            </header>

            {/* Projects Section */}
            <main id="projects" className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
                <AnimatedSection delay={0.2} className="mb-12">
                    <p className="section-number mb-1">01 — Work</p>
                    <div className="flex items-end gap-6">
                        <h2 className="text-3xl font-heading text-glossy">Selected Projects</h2>
                        <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-black/20 to-transparent dark:from-white/20 mb-2" />
                    </div>
                </AnimatedSection>

                {/* Featured Project Spotlight */}
                {featuredProject && (
                    <AnimatedSection delay={0.1} className="mb-16">
                        <div className="relative group">
                            <div className="relative glass-panel rounded-xl overflow-hidden flex flex-col md:flex-row hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] transition-all">
                                <div
                                    className={`md:w-3/5 h-64 md:h-auto overflow-hidden relative ${featuredProject.imageUrl ? 'cursor-zoom-in' : ''}`}
                                    onClick={() => {
                                        if (featuredProject.imageUrl) {
                                            setIsFeaturedLightboxOpen(true);
                                        } else {
                                            alert("No image available to preview.");
                                        }
                                    }}
                                >
                                    <img src={featuredProject.imageUrl} alt={featuredProject.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-4 left-4 bg-[#1a73e8] dark:bg-[#8AB4F8] text-white dark:text-[#202124] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star size={12} fill="currentColor" /> SPOTLIGHT
                                    </div>
                                </div>
                                <div className="md:w-2/5 p-8 flex flex-col justify-center">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{featuredProject.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                        {featuredProject.description}
                                    </p>
                                    <div className="flex gap-2 mb-8">
                                        <span className="px-3 py-1 glass-panel text-black dark:text-white rounded-full text-xs font-bold uppercase tracking-wider">
                                            {featuredProject.category}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-auto">
                                        {featuredProject.projectUrl && (
                                            <a href={featuredProject.projectUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-[#222] dark:hover:bg-gray-200 py-3 rounded-xl font-bold text-center transition-all shadow-lg">
                                                View Live
                                            </a>
                                        )}
                                        {featuredProject.downloadUrl && (
                                            <a href={featuredProject.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1 glass-panel hover:scale-105 py-3 rounded-xl font-bold text-center transition-all text-black dark:text-white">
                                                Download APK
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.length > 0 ? (
                            projects.map((project, idx) => (
                                <AnimatedSection key={project.id} delay={idx * 0.1}>
                                    <Tilt
                                        tiltMaxAngleX={5}
                                        tiltMaxAngleY={5}
                                        scale={1.02}
                                        transitionSpeed={2000}
                                        className="h-full"
                                    >
                                        <ProjectCard project={project} />
                                    </Tilt>
                                </AnimatedSection>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center glass-panel rounded-3xl flex flex-col items-center justify-center border-dashed border-2 dark:border-white/10 border-black/10">
                                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
                                    <FolderOpen size={32} className="text-slate-400 dark:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-black dark:text-white mb-2">No Projects Found</h3>
                                <p className="text-black/60 dark:text-gray-400 text-md max-w-sm mx-auto mb-6">You haven't added any projects to your portfolio yet. Head over to the admin dashboard to create your first one.</p>
                                <a href="/admin" className="px-8 py-3 btn-3d inline-block mt-2 rounded-full">
                                    Manage Projects
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Experience & Certifications Section */}
            {(experiences.length > 0 || certifications.length > 0) && (
                <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Experience Column */}
                        {experiences.length > 0 && (
                            <div id="experience" className="scroll-mt-24">
                                <AnimatedSection delay={0.2} className="mb-8">
                                    <p className="section-number mb-1">02 — Background</p>
                                    <div className="flex items-end gap-4">
                                        <h2 className="text-3xl font-heading text-glossy">Experience</h2>
                                        <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-black/20 to-transparent dark:from-white/20 mb-2" />
                                    </div>
                                </AnimatedSection>
                                
                                <div className="space-y-6">
                                    {experiences.map((exp, idx) => (
                                        <AnimatedSection key={exp.id} delay={0.2 + (idx * 0.1)} className="glass-panel p-6 rounded-3xl relative group transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)] border border-transparent hover:border-black/5 dark:hover:border-white/5">
                                            <div className="flex gap-4 sm:gap-6">
                                                {/* Logo/Image */}
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center relative shadow-inner">
                                                    {exp.imageUrl ? (
                                                        exp.fileType === 'pdf' ? (
                                                            <div className="w-full h-full overflow-hidden relative bg-white flex items-center justify-center">
                                                                <iframe 
                                                                    src={`${exp.imageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                                                                    title="PDF Preview"
                                                                    className="w-[200%] h-[200%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                                    scrolling="no"
                                                                />
                                                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <img src={exp.imageUrl} alt={exp.organization} className="w-full h-full object-cover" />
                                                        )
                                                    ) : (
                                                        <Briefcase className="text-gray-400" size={24} />
                                                    )}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                                                                {exp.title}
                                                            </h3>
                                                            <div className="text-black/70 dark:text-gray-300 font-medium flex items-center gap-2">
                                                                {exp.organization}
                                                                {(exp.linkUrl || exp.fileType === 'pdf') && (
                                                                    <a href={exp.linkUrl || exp.imageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
                                                                        <ExternalLink size={14} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-bold px-3 py-1.5 bg-black/5 dark:bg-white/10 rounded-full text-black/70 dark:text-gray-300 whitespace-nowrap h-fit shadow-sm border border-black/5 dark:border-white/5">
                                                            {exp.duration}
                                                        </span>
                                                    </div>
                                                    {exp.description && (
                                                        <p className="text-black/80 dark:text-gray-400 text-sm leading-relaxed mt-3 whitespace-pre-wrap">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </AnimatedSection>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Certifications Column */}
                        {certifications.length > 0 && (
                            <div id="certifications" className="scroll-mt-24">
                                <AnimatedSection delay={0.3} className="mb-8">
                                    <p className="section-number mb-1">03 — Credentials</p>
                                    <div className="flex items-end gap-4">
                                        <h2 className="text-3xl font-heading text-glossy">Certifications</h2>
                                        <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-black/20 to-transparent dark:from-white/20 mb-2" />
                                    </div>
                                </AnimatedSection>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                                    {certifications.map((cert, idx) => (
                                        <AnimatedSection key={cert.id} delay={0.3 + (idx * 0.1)} className="glass-panel p-6 rounded-3xl flex flex-col h-full group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)] border border-transparent hover:border-black/5 dark:hover:border-white/5">
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center p-1 shadow-inner">
                                                    {cert.imageUrl ? (
                                                        cert.fileType === 'pdf' ? (
                                                            <div className="w-full h-full rounded-full overflow-hidden relative bg-white flex items-center justify-center">
                                                                <iframe 
                                                                    src={`${cert.imageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                                                                    title="PDF Preview"
                                                                    className="w-[200%] h-[200%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                                    scrolling="no"
                                                                />
                                                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <img src={cert.imageUrl} alt={cert.organization} className="w-full h-full object-contain" />
                                                        )
                                                    ) : (
                                                        <Star className="text-gray-400" size={24} />
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-lg text-black/70 dark:text-gray-300 uppercase tracking-wider border border-black/5 dark:border-white/5">
                                                    {cert.duration}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-base font-bold text-black dark:text-white mb-1.5 leading-snug">{cert.title}</h3>
                                            <p className="text-black/60 dark:text-gray-400 text-sm font-medium mb-3">{cert.organization}</p>
                                            
                                            {cert.description && (
                                                <p className="text-black/70 dark:text-gray-400 text-sm mb-5 flex-1 leading-relaxed">
                                                    {cert.description}
                                                </p>
                                            )}
                                            
                                            <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                                                {(cert.linkUrl || cert.fileType === 'pdf') ? (
                                                    <a href={cert.linkUrl || cert.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-black dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors py-1">
                                                        View Credential <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                    </a>
                                                ) : (
                                                    <span className="text-sm font-bold text-black/40 dark:text-gray-600 flex items-center gap-1.5 py-1">
                                                        <Sparkles size={14} /> Verified
                                                    </span>
                                                )}
                                            </div>
                                        </AnimatedSection>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements Column */}
                        {achievements.length > 0 && (
                            <div id="achievements" className="scroll-mt-24 mt-12">
                                <AnimatedSection delay={0.3} className="mb-8">
                                    <p className="section-number mb-1">04 — Highlights</p>
                                    <div className="flex items-end gap-4">
                                        <h2 className="text-3xl font-heading text-glossy">Achievements</h2>
                                        <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-black/20 to-transparent dark:from-white/20 mb-2" />
                                    </div>
                                </AnimatedSection>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                                    {achievements.map((ach, idx) => (
                                        <AnimatedSection key={ach.id} delay={0.3 + (idx * 0.1)} className="glass-panel p-6 rounded-3xl flex flex-col h-full group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)] border border-transparent hover:border-black/5 dark:hover:border-white/5">
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center p-1 shadow-inner">
                                                    {ach.imageUrl ? (
                                                        ach.fileType === 'pdf' ? (
                                                            <div className="w-full h-full rounded-full overflow-hidden relative bg-white flex items-center justify-center">
                                                                <iframe 
                                                                    src={`${ach.imageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                                                                    title="PDF Preview"
                                                                    className="w-[200%] h-[200%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                                    scrolling="no"
                                                                />
                                                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <img src={ach.imageUrl} alt={ach.organization} className="w-full h-full object-cover rounded-full" />
                                                        )
                                                    ) : (
                                                        <Award className="text-gray-400" size={24} />
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-lg text-black/70 dark:text-gray-300 uppercase tracking-wider border border-black/5 dark:border-white/5">
                                                    {ach.duration}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-base font-bold text-black dark:text-white mb-1.5 leading-snug">{ach.title}</h3>
                                            <p className="text-black/60 dark:text-gray-400 text-sm font-medium mb-3">{ach.organization}</p>
                                            
                                            {ach.description && (
                                                <p className="text-black/70 dark:text-gray-400 text-sm mb-5 flex-1 leading-relaxed">
                                                    {ach.description}
                                                </p>
                                            )}
                                            
                                            <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                                                {(ach.linkUrl || ach.imageUrl) && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (ach.allowDownload) {
                                                                // If downloads allowed, just open in new tab
                                                                window.open(ach.linkUrl || ach.imageUrl, '_blank');
                                                            } else {
                                                                // If no downloads, open secure viewer
                                                                setSecureViewerUrl(ach.imageUrl || ach.linkUrl);
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 text-sm font-bold text-black dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors py-1 cursor-pointer bg-transparent border-none p-0 m-0"
                                                    >
                                                        View Certificate <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        </AnimatedSection>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Contact Section */}
            <section id="contact" className="max-w-3xl mx-auto px-6 pb-24 relative z-10">
                <AnimatedSection delay={0.2} className="shimmer-hover glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none"></div>
                    <p className="section-number mb-2">05 — Say Hello</p>
                    <h2 className="text-3xl font-heading text-glossy mb-4">Let's Connect</h2>
                    <p className="text-black/80 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                        Have a project in mind, or just want to say hi? Send me a message and I'll get back to you as soon as I can.
                    </p>

                    <form onSubmit={handleContactSubmit} className="space-y-4 max-w-md mx-auto text-left relative z-10">
                        <div>
                            <label className="block text-sm font-bold text-black dark:text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full bg-gray-100/50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all placeholder-black/40 dark:placeholder-gray-500"
                                placeholder="John Doe"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full bg-gray-100/50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all placeholder-black/40 dark:placeholder-gray-500"
                                placeholder="john@example.com"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black dark:text-gray-300 mb-1">Message</label>
                            <textarea
                                rows={4}
                                className="w-full bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none placeholder-gray-400"
                                placeholder="What's on your mind?"
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                required
                            />
                        </div>

                        {submitMessage.text && (
                            <div className={`p-3 rounded-xl text-sm ${submitMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400'} border ${submitMessage.type === 'error' ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}`}>
                                {submitMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 btn-3d flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-[4px]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </AnimatedSection>
            </section>

            <footer className="border-t border-gray-200 dark:border-white/10 py-12 text-center bg-gray-50/80 dark:bg-black/40 backdrop-blur-md transition-colors relative z-10">
                <p className="text-black/70 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} {profile.name}. All rights reserved.
                </p>
            </footer>

            {/* AI Chatbot */}
            <Chatbot ref={chatbotRef} />

            {/* Resume Viewer Modal */}
            <ResumeModal
                isOpen={isResumeOpen}
                onClose={() => setIsResumeOpen(false)}
                resumeUrl={profile.resumeUrl}
                userName={profile.name}
            />
            {/* Featured Project Lightbox */}
            {featuredProject && (
                <ImageLightbox
                    isOpen={isFeaturedLightboxOpen}
                    onClose={() => setIsFeaturedLightboxOpen(false)}
                    images={[featuredProject.imageUrl, ...(featuredProject.imageUrls || [])].filter(Boolean)}
                    initialIndex={0}
                />
            )}

            <BackToTop />

            <SecureViewerModal 
                isOpen={!!secureViewerUrl} 
                fileUrl={secureViewerUrl} 
                onClose={() => setSecureViewerUrl(null)} 
            />
        </div >
    );
};

export default Home;
