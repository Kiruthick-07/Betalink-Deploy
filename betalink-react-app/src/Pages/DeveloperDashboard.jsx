import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appAPI, chatAPI, reviewAPI } from '../services/api';
import { logout, getUser } from '../utils/auth';
import logo2 from '../assets/logo2.png';
import { HiViewGrid, HiCube, HiUsers, HiChatAlt2, HiChartBar, HiCog, HiLogout, HiPlus, HiMail, HiDownload, HiAnnotation, HiTrash } from 'react-icons/hi';
import Analytics from './Analytics';

const DeveloperDashboard = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [showMessagesModal, setShowMessagesModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [reviews, setReviews] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedAppFeedback, setSelectedAppFeedback] = useState({ app: null, reviews: [] });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [appToDelete, setAppToDelete] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        profilePic: null,
        profilePicPreview: null
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Form state
    const [appData, setAppData] = useState({
        title: '',
        description: '',
        apk: null
    });
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        // Redirect testers to their dashboard
        if (user.role === 'tester') {
            navigate('/tester-dashboard');
            return;
        }
        
        fetchApps();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Poll for new messages every 10 seconds
    useEffect(() => {
        if (user?.role === 'developer') {
            fetchConversations();
            const interval = setInterval(() => {
                fetchConversations();
            }, 10000); // Check every 10 seconds
            
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchApps = async () => {
        try {
            // If developer, maybe show OWN apps? Or all apps?
            // "All uploaded apps are displayed on the dashboard" - usually implies Store view for testers, 
            // but "The dashboard includes an Add Apps button" implies this is the Developer's workspace.
            // I will default to showing "My Apps" for developers if I implemented that filter, 
            // but the prompt says "All uploaded apps". Let's assume the Dashboard is "My Apps" for Developer, 
            // but maybe a "Marketplace" for Tester? 
            // Let's stick to: "Get Apps".
            const mode = user?.role === 'developer' ? 'developer' : '';
            const response = await appAPI.getApps(mode);
            if (response.success) {
                setApps(response.apps);
                // Fetch reviews after apps are loaded
                await fetchAllReviewsForApps(response.apps);
            }
        } catch (error) {
            console.error('Failed to fetch apps', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            if (response.success) {
                setConversations(response.conversations);
                
                // Calculate total unread count from all conversations
                const totalUnread = response.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
                setUnreadCount(totalUnread);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const fetchAllReviewsForApps = async (appsData) => {
        try {
            const reviewsData = [];
            for (const app of appsData) {
                const response = await reviewAPI.getReviews(app._id);
                if (response.success) {
                    reviewsData.push(...response.reviews.map(r => ({ ...r, appTitle: app.title })));
                }
            }
            setAllReviews(reviewsData); // Store all reviews for metrics
            setReviews(reviewsData.slice(0, 5)); // Get latest 5 for display
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        }
    };

    const handleViewFeedback = async (app) => {
        try {
            const response = await reviewAPI.getReviews(app._id);
            if (response.success) {
                setSelectedAppFeedback({ app, reviews: response.reviews });
                setShowFeedbackModal(true);
            }
        } catch (error) {
            console.error('Failed to fetch app reviews', error);
        }
    };

    const handleDeleteApp = async () => {
        if (!appToDelete) return;
        
        try {
            console.log('Deleting app:', appToDelete._id);
            const response = await appAPI.deleteApp(appToDelete._id);
            console.log('Delete response:', response);
            if (response.success) {
                setMessage({ type: 'success', text: 'App deleted successfully!' });
                setApps(apps.filter(app => app._id !== appToDelete._id));
                setShowDeleteConfirm(false);
                setAppToDelete(null);
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            console.error('Delete error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete app';
            setMessage({ type: 'error', text: errorMessage });
            setShowDeleteConfirm(false);
            setAppToDelete(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAppData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setAppData(prev => ({ ...prev, apk: e.target.files[0] }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!appData.apk) {
            setMessage({ type: 'error', text: 'Please select an APK file' });
            return;
        }

        const formData = new FormData();
        formData.append('title', appData.title);
        formData.append('description', appData.description);
        formData.append('apk', appData.apk);

        try {
            setUploading(true);
            const response = await appAPI.uploadApp(formData);
            if (response.success) {
                setMessage({ type: 'success', text: 'App uploaded successfully!' });
                setShowModal(false);
                setAppData({ title: '', description: '', apk: null });
                fetchApps();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData(prev => ({
                ...prev,
                profilePic: file,
                profilePicPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleProfileNameChange = (e) => {
        setProfileData(prev => ({
            ...prev,
            fullName: e.target.value
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('fullName', profileData.fullName);
            if (profileData.profilePic) {
                formData.append('profilePic', profileData.profilePic);
            }

            const response = await authAPI.updateProfile(formData);
            
            if (response.success) {
                // Update user in localStorage
                setUser(response.user);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setShowSettingsModal(false);
                
                // Reset profile pic preview
                setProfileData(prev => ({
                    ...prev,
                    profilePic: null,
                    profilePicPreview: null
                }));
                
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                    window.location.reload(); // Reload to show updated profile
                }, 1500);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const menuItems = [
        { id: 'dashboard', icon: HiViewGrid, label: 'Dashboard' },
        { id: 'messages', icon: HiMail, label: 'Messages' },
        { id: 'analytics', icon: HiChartBar, label: 'Analytics' },
    ];

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            background: '#ffffff',
            fontFamily: "'Inter', -apple-system, sans-serif",
        },
        sidebar: {
            width: isMobile ? (sidebarOpen ? '280px' : '0') : '280px',
            backgroundColor: '#000000',
            backdropFilter: 'blur(10px)',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            position: isMobile ? 'fixed' : 'sticky',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: 1000,
            transition: 'width 0.3s ease, transform 0.3s ease',
            transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
            overflow: 'hidden',
        },
        sidebarHeader: {
            padding: '2rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        logo: {
            height: '36px',
            width: 'auto',
            filter: 'brightness(0) invert(1)',
        },
        profileSection: {
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        avatar: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            fontWeight: '600',
            fontSize: '18px',
        },
        profileInfo: {
            flex: 1,
        },
        profileName: {
            fontWeight: '600',
            color: '#ffffff',
            fontSize: '15px',
            marginBottom: '2px',
        },
        profileRole: {
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
        },
        navigation: {
            flex: 1,
            padding: '1rem 0.75rem',
            overflowY: 'auto',
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            marginBottom: '4px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '15px',
            fontWeight: '500',
        },
        navItemActive: {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        sidebarFooter: {
            padding: '1rem 0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
        mainContent: {
            flex: 1,
            padding: isMobile ? '1rem' : '2rem',
            overflowY: 'auto',
            marginLeft: isMobile && sidebarOpen ? '280px' : '0',
            transition: 'margin-left 0.3s ease',
        },
        header: {
            marginBottom: '2rem',
            backgroundColor: '#ffffff',
            padding: '1.5rem 2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
        headerTop: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
        },
        pageTitle: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: '#000000',
            textShadow: 'none',
        },
        subtitle: {
            fontSize: '1rem',
            color: '#666666',
            fontWeight: '400',
        },
        headerActions: {
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
        },
        btnPrimary: {
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
        btnSecondary: {
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        metricsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
        },
        metricCard: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            border: '1px solid #e5e5e5',
        },
        metricHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
        },
        metricIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            backgroundColor: '#000000',
            color: '#ffffff',
        },
        metricValue: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '0.25rem',
        },
        metricLabel: {
            fontSize: '0.875rem',
            color: '#666666',
            fontWeight: '500',
        },
        contentSection: {
            backgroundColor: '#fff',
            borderRadius: '20px',
            padding: isMobile ? '1.5rem' : '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
        sectionHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a202c',
        },
        projectsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
        },
        projectCard: {
            border: '2px solid #e5e5e5',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s',
            cursor: 'pointer',
            background: '#fff',
        },
        projectTitle: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#000000',
            marginBottom: '0.5rem',
        },
        projectDesc: {
            color: '#666666',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            marginBottom: '1rem',
        },
        projectActions: {
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
        },
        btnAction: {
            flex: 1,
            minWidth: '100px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #000000',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px',
            textAlign: 'center',
            transition: 'all 0.2s',
        },
        feedbackList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        feedbackItem: {
            padding: '1.25rem',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            transition: 'all 0.2s',
            backgroundColor: '#fafafa',
        },
        feedbackHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
        },
        feedbackUser: {
            fontWeight: '600',
            color: '#000000',
            fontSize: '15px',
        },
        feedbackApp: {
            color: '#666666',
            fontSize: '13px',
            fontWeight: '500',
        },
        feedbackRating: {
            display: 'flex',
            gap: '2px',
            color: '#000000',
        },
        feedbackText: {
            color: '#333333',
            fontSize: '14px',
            lineHeight: '1.6',
            marginTop: '0.5rem',
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '1rem',
        },
        modal: {
            backgroundColor: '#fff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        modalHeader: {
            padding: '1.5rem 2rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a202c',
        },
        modalBody: {
            padding: '2rem',
        },
        formGroup: {
            marginBottom: '1.5rem',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#2d3748',
            fontSize: '14px',
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
        },
        textarea: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '15px',
            outline: 'none',
            resize: 'vertical',
            minHeight: '100px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
        },
        fileInput: {
            border: '2px dashed #cbd5e0',
            padding: '2rem',
            textAlign: 'center',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: '#f7fafc',
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '1.5rem 2rem',
            borderTop: '1px solid #e2e8f0',
        },
        btnCancel: {
            backgroundColor: '#fff',
            color: '#4a5568',
            border: '2px solid #e2e8f0',
            padding: '10px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
        },
        btnSubmit: {
            background: '#000000',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        conversationItem: {
            padding: '1rem',
            borderBottom: '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        conversationName: {
            fontWeight: '600',
            color: '#1a202c',
            fontSize: '15px',
        },
        unreadBadge: {
            backgroundColor: '#ef4444',
            color: '#fff',
            borderRadius: '12px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: '700',
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#666666',
        },
        emptyIcon: {
            fontSize: '3rem',
            marginBottom: '1rem',
            opacity: 0.5,
            color: '#000000',
        },
        hamburger: {
            display: isMobile ? 'block' : 'none',
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1001,
            backgroundColor: '#000000',
            border: '1px solid #ffffff',
            borderRadius: '12px',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            fontSize: '24px',
            color: '#ffffff',
        },
    };

    if (loading) return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '100vh',
            background: '#ffffff',
            color: '#000000',
            fontSize: '1.5rem',
            fontWeight: '600'
        }}>
            Loading...
        </div>
    );

    const totalTesters = [...new Set(allReviews.map(r => r.tester?._id || r.tester))].length;
    const totalIssues = unreadCount;

    // Show Analytics page if analytics menu is active
    if (showAnalytics) {
        return <Analytics onBack={() => setShowAnalytics(false)} />;
    }

    return (
        <div style={styles.container}>
            {/* Hamburger Menu for Mobile */}
            {isMobile && (
                <button style={styles.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
                    ☰
                </button>
            )}

            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <img src={logo2} alt="BetaLink" style={styles.logo} />
                </div>

                <div style={styles.profileSection}>
                    <div style={{
                        ...styles.avatar,
                        backgroundImage: user?.profilePic ? `url(http://localhost:5000/${user.profilePic})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}>
                        {!user?.profilePic && (user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'D')}
                    </div>
                    <div style={styles.profileInfo}>
                        <div style={styles.profileName}>{user?.fullName || user?.username || 'Developer'}</div>
                        <div style={styles.profileRole}>Developer Account</div>
                    </div>
                </div>

                <nav style={styles.navigation}>
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.navItem,
                                ...(activeMenu === item.id ? styles.navItemActive : {}),
                                position: 'relative'
                            }}
                            onClick={() => {
                                setActiveMenu(item.id);
                                if (item.id === 'messages') {
                                    setShowMessagesModal(true);
                                    fetchConversations();
                                } else if (item.id === 'analytics') {
                                    setShowAnalytics(true);
                                }
                            }}
                            onMouseEnter={(e) => {
                                if (activeMenu !== item.id) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeMenu !== item.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            {item.id === 'messages' && unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '12px',
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    border: '2px solid #000000'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>

                <div style={styles.sidebarFooter}>
                    <div
                        style={{ ...styles.navItem, color: 'rgba(255, 255, 255, 0.7)' }}
                        onClick={handleLogout}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <HiLogout size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.mainContent}>
                {/* Success/Error Message */}
                {message.text && (
                    <div style={{
                        padding: '1rem 1.5rem',
                        marginBottom: '1.5rem',
                        borderRadius: '12px',
                        backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                        color: message.type === 'error' ? '#991b1b' : '#065f46',
                        border: `2px solid ${message.type === 'error' ? '#ef4444' : '#10b981'}`,
                        fontSize: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {message.text}
                    </div>
                )}
                
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTop}>
                        <div>
                            <h1 style={styles.pageTitle}>Developer Dashboard</h1>
                            <p style={styles.subtitle}>Overview of beta testing activity</p>
                        </div>
                        <div style={styles.headerActions}>
                            <button 
                                style={styles.btnPrimary} 
                                onClick={() => setShowModal(true)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <HiPlus size={20} />
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div style={styles.metricsGrid}>
                    <div 
                        style={styles.metricCard}
                        onClick={() => setShowModal(true)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                        }}
                    >
                        <div style={styles.metricHeader}>
                            <div style={styles.metricIcon}>
                                <HiCube />
                            </div>
                        </div>
                        <div style={styles.metricValue}>{apps.length}</div>
                        <div style={styles.metricLabel}>Active Beta Projects</div>
                    </div>

                    <div 
                        style={styles.metricCard}
                        onClick={() => setShowMessagesModal(true)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                        }}
                    >
                        <div style={styles.metricHeader}>
                            <div style={styles.metricIcon}>
                                <HiUsers />
                            </div>
                        </div>
                        <div style={styles.metricValue}>{totalTesters}</div>
                        <div style={styles.metricLabel}>Total Beta Testers</div>
                    </div>

                    <div 
                        style={styles.metricCard}
                        onClick={() => setShowAnalytics(true)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                        }}
                    >
                        <div style={styles.metricHeader}>
                            <div style={styles.metricIcon}>
                                <HiChartBar />
                            </div>
                        </div>
                        <div style={styles.metricValue}>{allReviews.length}</div>
                        <div style={styles.metricLabel}>Feedback Received</div>
                    </div>
                </div>

                {/* Projects Section */}
                <div style={styles.contentSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>My Beta Projects</h2>
                    </div>
                    {apps.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}><HiCube size={48} /></div>
                            <h3>No projects yet</h3>
                            <p>Create your first beta project to get started</p>
                        </div>
                    ) : (
                        <div style={styles.projectsGrid}>
                            {apps.map((app) => (
                                <div 
                                    key={app._id} 
                                    style={styles.projectCard}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#000000';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e5e5';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <h3 style={styles.projectTitle}>{app.title}</h3>
                                    <p style={styles.projectDesc}>{app.description}</p>
                                    <div style={styles.projectActions}>
                                        <button 
                                            style={{ ...styles.btnAction, flex: 1 }}
                                            onClick={() => handleViewFeedback(app)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#000000';
                                                e.currentTarget.style.color = '#fff';
                                                e.currentTarget.style.borderColor = '#000000';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ffffff';
                                                e.currentTarget.style.color = '#000000';
                                                e.currentTarget.style.borderColor = '#000000';
                                            }}
                                        >
                                            <HiAnnotation style={{ display: 'inline', marginRight: '4px' }} />
                                            View Feedback
                                        </button>
                                        <button 
                                            style={{ ...styles.btnAction, flex: 0, minWidth: '50px', padding: '8px' }}
                                            onClick={() => {
                                                setAppToDelete(app);
                                                setShowDeleteConfirm(true);
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ef4444';
                                                e.currentTarget.style.color = '#fff';
                                                e.currentTarget.style.borderColor = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ffffff';
                                                e.currentTarget.style.color = '#000000';
                                                e.currentTarget.style.borderColor = '#000000';
                                            }}
                                            title="Delete App"
                                        >
                                            <HiTrash style={{ display: 'inline' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Feedback Section */}
                {reviews.length > 0 && (
                    <div style={styles.contentSection}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Recent Feedback</h2>
                        </div>
                        <div style={styles.feedbackList}>
                            {reviews.map((review, index) => (
                                <div 
                                    key={index} 
                                    style={styles.feedbackItem}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                        e.currentTarget.style.borderColor = '#000000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fafafa';
                                        e.currentTarget.style.borderColor = '#e5e5e5';
                                    }}
                                >
                                    <div style={styles.feedbackHeader}>
                                        <div>
                                            <div style={styles.feedbackUser}>Beta Tester</div>
                                            <div style={styles.feedbackApp}>{review.appTitle}</div>
                                        </div>
                                        <div style={styles.feedbackRating}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <div style={styles.feedbackText}>{review.content || review.feedback}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Add App Modal */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Upload New Beta Project</h2>
                        </div>

                        <div style={styles.modalBody}>
                            {message.text && (
                                <div style={{
                                    padding: '12px 16px',
                                    marginBottom: '1.5rem',
                                    borderRadius: '10px',
                                    backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                                    color: message.type === 'error' ? '#991b1b' : '#065f46',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleUpload}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>App Title</label>
                                    <input
                                        style={styles.input}
                                        name="title"
                                        value={appData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. FitTracker Pro"
                                        required
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Description</label>
                                    <textarea
                                        style={styles.textarea}
                                        name="description"
                                        value={appData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe your app and what you'd like testers to focus on..."
                                        required
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>APK File</label>
                                    <div 
                                        style={styles.fileInput}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.backgroundColor = '#f0f4ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#cbd5e0';
                                            e.currentTarget.style.backgroundColor = '#f7fafc';
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept=".apk,application/vnd.android.package-archive"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                            id="apk-upload"
                                            required
                                        />
                                        <label htmlFor="apk-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#000000' }}><HiCube size={48} /></div>
                                            <div style={{ color: '#000000', fontWeight: '600', marginBottom: '0.25rem' }}>
                                                {appData.apk ? appData.apk.name : 'Click to upload APK'}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#666666' }}>
                                                Only .apk files are accepted
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                type="button"
                                style={styles.btnCancel}
                                onClick={() => setShowModal(false)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                style={{
                                    ...styles.btnSubmit,
                                    opacity: uploading ? 0.6 : 1,
                                    cursor: uploading ? 'not-allowed' : 'pointer'
                                }}
                                onClick={handleUpload}
                                disabled={uploading}
                                onMouseEnter={(e) => {
                                    if (!uploading) e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!uploading) e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {uploading ? 'Uploading...' : 'Upload Beta Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Modal */}
            {showMessagesModal && (
                <div style={styles.modalOverlay} onClick={() => setShowMessagesModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Tester Messages</h2>
                        </div>
                        
                        <div style={styles.modalBody}>
                            {conversations.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}><HiMail size={48} /></div>
                                    <h3>No messages yet</h3>
                                    <p>Messages from beta testers will appear here</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {conversations.map((conv, index) => (
                                        <div
                                            key={index}
                                            style={styles.conversationItem}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            onClick={() => {
                                                setShowMessagesModal(false);
                                                navigate(`/chat/${conv.partner.id}${conv.app ? `?appId=${conv.app.id}&appTitle=${encodeURIComponent(conv.app.title)}` : ''}`);
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <span style={styles.conversationName}>{conv.partner.fullName}</span>
                                                    {conv.unreadCount > 0 && (
                                                        <span style={styles.unreadBadge}>{conv.unreadCount}</span>
                                                    )}
                                                </div>
                                                {conv.app && (
                                                    <div style={{ fontSize: '13px', color: '#666666', marginBottom: '0.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <HiCube size={14} /> {conv.app.title}
                                                    </div>
                                                )}
                                                <div style={{ 
                                                    fontSize: '14px', 
                                                    color: '#718096', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis', 
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {conv.lastMessage}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                                                {new Date(conv.lastMessageTime).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button
                                style={styles.btnCancel}
                                onClick={() => setShowMessagesModal(false)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && selectedAppFeedback.app && (
                <div style={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
                    <div style={{ ...styles.modal, maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h2 style={styles.modalTitle}>Feedback & Reviews</h2>
                                <div style={{ fontSize: '14px', color: '#666666', marginTop: '4px', fontWeight: 'normal' }}>
                                    {selectedAppFeedback.app.title}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ ...styles.modalBody, padding: '1.5rem' }}>
                            {selectedAppFeedback.reviews.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}><HiAnnotation size={48} /></div>
                                    <h3 style={{ color: '#000000', marginBottom: '0.5rem' }}>No feedback yet</h3>
                                    <p style={{ color: '#666666' }}>Testers haven't submitted feedback for this app yet</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ 
                                        padding: '1rem', 
                                        backgroundColor: '#fafafa', 
                                        borderRadius: '12px',
                                        border: '1px solid #e5e5e5'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#666666', marginBottom: '0.5rem' }}>
                                            Total Reviews
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#000000' }}>
                                            {selectedAppFeedback.reviews.length}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666666', marginTop: '0.5rem' }}>
                                            Average Rating: {(selectedAppFeedback.reviews.reduce((sum, r) => sum + r.rating, 0) / selectedAppFeedback.reviews.length).toFixed(1)} / 5.0
                                        </div>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {selectedAppFeedback.reviews.map((review, index) => (
                                            <div 
                                                key={index} 
                                                style={{
                                                    padding: '1.5rem',
                                                    border: '2px solid #e5e5e5',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#000000';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#e5e5e5';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                                    <div>
                                                        <div style={{ 
                                                            fontSize: '16px', 
                                                            fontWeight: '600', 
                                                            color: '#000000',
                                                            marginBottom: '0.25rem'
                                                        }}>
                                                            Beta Tester #{index + 1}
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#999' }}>
                                                            {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'long', 
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: '#000000',
                                                        borderRadius: '8px',
                                                        color: '#ffffff'
                                                    }}>
                                                        <span style={{ fontSize: '18px', fontWeight: '700' }}>{review.rating}</span>
                                                        <span style={{ fontSize: '14px' }}>/5</span>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <div style={{ 
                                                        fontSize: '20px', 
                                                        color: '#000000',
                                                        letterSpacing: '2px'
                                                    }}>
                                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                    </div>
                                                </div>

                                                <div style={{ 
                                                    padding: '1rem',
                                                    backgroundColor: '#fafafa',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e5e5'
                                                }}>
                                                    <div style={{ 
                                                        fontSize: '13px', 
                                                        color: '#666666', 
                                                        fontWeight: '600',
                                                        marginBottom: '0.5rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        Feedback
                                                    </div>
                                                    <div style={{ 
                                                        color: '#000000', 
                                                        fontSize: '15px', 
                                                        lineHeight: '1.6',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {review.content || review.feedback}
                                                    </div>
                                                    
                                                    {review.image && (
                                                        <div style={{ marginTop: '1rem' }}>
                                                            <div style={{ 
                                                                fontSize: '13px', 
                                                                color: '#666666', 
                                                                fontWeight: '600',
                                                                marginBottom: '0.5rem',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                Screenshot
                                                            </div>
                                                            <img 
                                                                src={`http://localhost:5000/${review.image}`}
                                                                alt="Review screenshot"
                                                                style={{
                                                                    maxWidth: '100%',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e5e5e5',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={(e) => {
                                                                    window.open(e.target.src, '_blank');
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button
                                style={{
                                    ...styles.btnSubmit,
                                    backgroundColor: '#000000',
                                    flex: 1
                                }}
                                onClick={() => setShowFeedbackModal(false)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#333333';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#000000';
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && appToDelete && (
                <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
                    <div style={{ ...styles.modal, maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Delete App?</h2>
                        </div>
                        
                        <div style={styles.modalBody}>
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>
                                    <HiTrash style={{ color: '#ef4444' }} />
                                </div>
                                <p style={{ fontSize: '15px', color: '#000000', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Are you sure you want to delete "{appToDelete.title}"?
                                </p>
                                <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.5' }}>
                                    This action cannot be undone. All feedback and data associated with this app will be permanently removed.
                                </p>
                            </div>
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button
                                style={styles.btnCancel}
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setAppToDelete(null);
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                Cancel
                            </button>
                            <button
                                style={{
                                    ...styles.btnSubmit,
                                    backgroundColor: '#ef4444'
                                }}
                                onClick={handleDeleteApp}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                            >
                                Delete App
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div style={styles.modalOverlay} onClick={() => setShowSettingsModal(false)}>
                    <div style={{ ...styles.modal, maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Profile Settings</h2>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666',
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={styles.modalBody}>
                            <form onSubmit={handleProfileUpdate}>
                                {/* Profile Picture Section */}
                                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                    <label style={styles.label}>Profile Picture</label>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        gap: '1rem',
                                        marginTop: '1rem'
                                    }}>
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            background: profileData.profilePicPreview ? `url(${profileData.profilePicPreview})` : '#000000',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            fontSize: '48px',
                                            fontWeight: '600',
                                            border: '4px solid #e5e5e5',
                                        }}>
                                            {!profileData.profilePicPreview && (user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U')}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePicChange}
                                            style={{ display: 'none' }}
                                            id="profile-pic-upload"
                                        />
                                        <label 
                                            htmlFor="profile-pic-upload"
                                            style={{
                                                ...styles.btnSecondary,
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ffffff';
                                            }}
                                        >
                                            Choose Photo
                                        </label>
                                    </div>
                                </div>

                                {/* Full Name Input */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={profileData.fullName}
                                        onChange={handleProfileNameChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button
                                style={styles.btnCancel}
                                onClick={() => setShowSettingsModal(false)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                Cancel
                            </button>
                            <button
                                style={{
                                    ...styles.btnSubmit,
                                    opacity: updatingProfile ? 0.6 : 1,
                                    cursor: updatingProfile ? 'not-allowed' : 'pointer'
                                }}
                                onClick={handleProfileUpdate}
                                disabled={updatingProfile}
                                onMouseEnter={(e) => {
                                    if (!updatingProfile) e.currentTarget.style.backgroundColor = '#333333';
                                }}
                                onMouseLeave={(e) => {
                                    if (!updatingProfile) e.currentTarget.style.backgroundColor = '#000000';
                                }}
                            >
                                {updatingProfile ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperDashboard;
