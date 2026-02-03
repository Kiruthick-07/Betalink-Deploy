import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appAPI, reviewAPI } from '../services/api';
import { logout, getUser } from '../utils/auth';
import logo2 from '../assets/logo2.png';
import { HiViewGrid, HiCube, HiDownload, HiAnnotation, HiMail, HiLogout } from 'react-icons/hi';

const TesterDashboard = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    // Review form state
    const [reviewData, setReviewData] = useState({
        content: '',
        rating: 5
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        // Redirect only developers to their dashboard
        if (user.role === 'developer') {
            navigate('/dashboard');
            return;
        }
        
        // Testers and clients can access this dashboard
        fetchApps();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchApps = async () => {
        try {
            const response = await appAPI.getApps();
            if (response.success) {
                setApps(response.apps);
            }
        } catch (error) {
            console.error('Failed to fetch apps', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (appId, appTitle) => {
        try {
            const response = await fetch(`http://localhost:5000/api/apps/download/${appId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('betalink_token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${appTitle}.apk`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Download failed. Please try again.');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        }
    };

    const handleViewDetails = (app) => {
        setSelectedApp(app);
        setShowDetailsModal(true);
    };

    const handleReviewClick = (app) => {
        setSelectedApp(app);
        setShowDetailsModal(false);
        setShowReviewModal(true);
        setMessage({ type: '', text: '' });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!reviewData.content.trim()) {
            setMessage({ type: 'error', text: 'Please enter your feedback' });
            return;
        }

        try {
            setSubmitting(true);
            
            // Create FormData to support file upload
            const formData = new FormData();
            formData.append('appId', selectedApp._id);
            formData.append('content', reviewData.content);
            formData.append('rating', reviewData.rating);
            
            // Add image if selected
            if (reviewData.image) {
                formData.append('image', reviewData.image);
            }
            
            const response = await reviewAPI.addReview(formData);

            if (response.success) {
                setMessage({ type: 'success', text: 'Review submitted successfully!' });
                setReviewData({ content: '', rating: 5, image: null, imagePreview: null });
                setTimeout(() => {
                    setShowReviewModal(false);
                    setSelectedApp(null);
                }, 1500);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit review' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleContactClick = (app) => {
        // Navigate to chat page with developer
        setShowDetailsModal(false);
        navigate(`/chat/${app.developer._id}?appId=${app._id}&appTitle=${encodeURIComponent(app.title)}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
            flexWrap: 'wrap',
            gap: '1rem',
        },
        pageTitle: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: '#000000',
        },
        subtitle: {
            fontSize: '1rem',
            color: '#666666',
            fontWeight: '400',
            marginTop: '0.25rem',
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
            border: '1px solid #e5e5e5',
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
            marginBottom: '1rem',
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
        grid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
        },
        card: {
            border: '2px solid #e5e5e5',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s',
            cursor: 'pointer',
            background: '#fff',
        },
        appLogo: {
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '1rem',
        },
        cardTitle: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#000000',
            marginBottom: '0.5rem',
        },
        cardMeta: {
            fontSize: '0.85rem',
            color: '#666666',
            marginBottom: '0.5rem',
            fontWeight: '500',
        },
        cardDesc: {
            color: '#666666',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            marginBottom: '1rem',
        },
        cardActions: {
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
        },
        btnAction: {
            flex: 1,
            minWidth: '90px',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
        },
        btnDownload: {
            backgroundColor: '#000000',
            color: '#ffffff',
        },
        btnReview: {
            border: '1px solid #000000',
        },
        btnContact: {
            border: '1px solid #000000',
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
        select: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '15px',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '1.5rem 2rem',
            borderTop: '1px solid #e2e8f0',
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
        alert: {
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '14px',
            fontWeight: '500',
        },
        alertSuccess: {
            backgroundColor: '#d1fae5',
            color: '#065f46',
        },
        alertError: {
            backgroundColor: '#fee2e2',
            color: '#991b1b',
        },
        fileInput: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '15px',
            cursor: 'pointer',
            boxSizing: 'border-box',
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

    if (loading) {
        return (
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
                    <div style={styles.avatar}>
                        {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div style={styles.profileInfo}>
                        <div style={styles.profileName}>{user?.fullName || user?.username || 'Tester'}</div>
                        <div style={styles.profileRole}>Beta Tester Account</div>
                    </div>
                </div>

                <nav style={styles.navigation}>
                    <div
                        style={{
                            ...styles.navItem,
                            ...styles.navItemActive
                        }}
                    >
                        <HiViewGrid size={20} />
                        <span>Dashboard</span>
                    </div>
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
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTop}>
                        <div>
                            <h1 style={styles.pageTitle}>Tester Dashboard</h1>
                            <p style={styles.subtitle}>Test and review beta applications</p>
                        </div>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div style={styles.metricsGrid}>
                    <div style={styles.metricCard}>
                        <div style={styles.metricIcon}>
                            <HiCube />
                        </div>
                        <div style={styles.metricValue}>{apps.length}</div>
                        <div style={styles.metricLabel}>Available Apps</div>
                    </div>
                </div>

                {/* Apps Section */}
                <div style={styles.contentSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Available Beta Apps</h2>
                    </div>
                    
                    {apps.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}><HiCube size={48} /></div>
                            <h3>No apps available yet</h3>
                            <p>Check back later when developers upload apps for testing</p>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {apps.map((app) => (
                                <div 
                                    key={app._id} 
                                    style={styles.card}
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
                                    <div style={styles.appLogo}>
                                        {app.title.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={styles.cardTitle}>{app.title}</div>
                                        <div style={styles.cardMeta}>
                                            By {app.developer?.fullName || 'Unknown Developer'}
                                        </div>
                                    </div>
                                    <div style={styles.cardActions}>
                                        <button
                                            style={{ ...styles.btnAction, ...styles.btnDownload }}
                                            onClick={() => handleViewDetails(app)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#333333';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#000000';
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* App Details Modal */}
            {showDetailsModal && selectedApp && (
                <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            {selectedApp.title}
                        </div>

                        <div style={styles.modalBody}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{
                                    ...styles.appLogo,
                                    width: '100px',
                                    height: '100px',
                                    fontSize: '2.5rem'
                                }}>
                                    {selectedApp.title.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#000', marginBottom: '0.5rem' }}>
                                        {selectedApp.title}
                                    </h3>
                                    <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                        <strong>Developer:</strong> {selectedApp.developer?.fullName || 'Unknown Developer'}
                                    </p>
                                    <p style={{ color: '#666', fontSize: '0.95rem' }}>
                                        <strong>Email:</strong> {selectedApp.developer?.email || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#000', marginBottom: '0.75rem' }}>
                                    Description
                                </h4>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {selectedApp.description}
                                </p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#000', marginBottom: '0.75rem' }}>
                                    Actions
                                </h4>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button
                                        style={{
                                            flex: 1,
                                            minWidth: '140px',
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            backgroundColor: '#000000',
                                            color: '#ffffff',
                                            border: 'none',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => handleDownload(selectedApp._id, selectedApp.title)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#333333';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#000000';
                                        }}
                                    >
                                        <HiDownload size={20} />
                                        Download App
                                    </button>
                                    <button
                                        style={{
                                            flex: 1,
                                            minWidth: '140px',
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            border: '2px solid #000000',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => handleReviewClick(selectedApp)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#000000';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                            e.currentTarget.style.color = '#000000';
                                        }}
                                    >
                                        <HiAnnotation size={20} />
                                        Write Review
                                    </button>
                                    <button
                                        style={{
                                            flex: 1,
                                            minWidth: '140px',
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            border: '2px solid #000000',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => handleContactClick(selectedApp)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#000000';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                            e.currentTarget.style.color = '#000000';
                                        }}
                                    >
                                        <HiMail size={20} />
                                        Contact Developer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                type="button"
                                style={styles.btnCancel}
                                onClick={() => setShowDetailsModal(false)}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedApp && (
                <div style={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            Review: {selectedApp.title}
                        </div>

                        <div style={styles.modalBody}>
                            {message.text && (
                                <div style={{
                                    ...styles.alert,
                                    ...(message.type === 'success' ? styles.alertSuccess : styles.alertError)
                                }}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleReviewSubmit}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Rating</label>
                                    <select
                                        style={styles.select}
                                        value={reviewData.rating}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                                    >
                                        <option value={5}>5 - Excellent</option>
                                        <option value={4}>4 - Good</option>
                                        <option value={3}>3 - Average</option>
                                        <option value={2}>2 - Poor</option>
                                        <option value={1}>1 - Very Poor</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Testing Feedback (Bugs, Errors, Test Results)
                                    </label>
                                    <textarea
                                        style={styles.textarea}
                                        placeholder="Describe any bugs, errors, or test results you encountered..."
                                        value={reviewData.content}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Screenshot (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setReviewData(prev => ({
                                                    ...prev,
                                                    image: file,
                                                    imagePreview: URL.createObjectURL(file)
                                                }));
                                            }
                                        }}
                                        style={styles.fileInput}
                                    />
                                    {reviewData.imagePreview && (
                                        <div style={{ marginTop: '1rem', position: 'relative' }}>
                                            <img 
                                                src={reviewData.imagePreview} 
                                                alt="Preview" 
                                                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setReviewData(prev => ({ ...prev, image: null, imagePreview: null }))}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    backgroundColor: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '30px',
                                                    height: '30px',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                type="button"
                                style={styles.btnCancel}
                                onClick={() => setShowReviewModal(false)}
                                disabled={submitting}
                                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#f7fafc')}
                                onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#fff')}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                style={{
                                    ...styles.btnSubmit,
                                    opacity: submitting ? 0.6 : 1,
                                    cursor: submitting ? 'not-allowed' : 'pointer'
                                }}
                                onClick={handleReviewSubmit}
                                disabled={submitting}
                                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#333333')}
                                onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#000000')}
                            >
                                {submitting ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TesterDashboard;
