import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCube, HiUsers, HiStar, HiDownload, HiTrendingUp, HiChartBar } from 'react-icons/hi';
import { appAPI, reviewAPI } from '../services/api';
import { getUser } from '../utils/auth';

const Analytics = ({ onBack }) => {
    const navigate = useNavigate();
    const user = getUser();
    const [apps, setApps] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [analytics, setAnalytics] = useState({
        totalDownloads: 0,
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviews: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const response = await appAPI.getApps('developer');
            if (response.success) {
                setApps(response.apps);
                if (response.apps.length > 0) {
                    setSelectedApp(response.apps[0]);
                    fetchAnalytics(response.apps[0]._id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch apps', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (appId) => {
        try {
            // Fetch the app data to get download count
            const appsResponse = await appAPI.getApps('developer');
            const currentApp = appsResponse.apps.find(app => app._id === appId);
            
            const reviewResponse = await reviewAPI.getReviews(appId);
            
            if (reviewResponse.success) {
                const reviews = reviewResponse.reviews;
                const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                let totalRating = 0;

                reviews.forEach(review => {
                    ratingDist[review.rating]++;
                    totalRating += review.rating;
                });

                const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

                setAnalytics({
                    totalDownloads: currentApp?.downloads || 0,
                    totalReviews: reviews.length,
                    averageRating: avgRating,
                    ratingDistribution: ratingDist,
                    reviews: reviews
                });
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    };

    const handleAppChange = (app) => {
        setSelectedApp(app);
        fetchAnalytics(app._id);
    };

    const maxRatingCount = Math.max(...Object.values(analytics.ratingDistribution));

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#ffffff',
            fontFamily: "'Inter', -apple-system, sans-serif",
        },
        header: {
            marginBottom: '2rem',
            backgroundColor: '#ffffff',
            padding: '1.5rem 2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '1rem',
            transition: 'all 0.2s',
        },
        headerTop: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
        },
        pageTitle: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '0.5rem',
        },
        subtitle: {
            fontSize: '1rem',
            color: '#666666',
            fontWeight: '400',
        },
        appSelector: {
            padding: '12px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '15px',
            fontWeight: '600',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '250px',
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
        },
        statCard: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e5e5',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
        },
        statIcon: {
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
        statValue: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '0.25rem',
        },
        statLabel: {
            fontSize: '0.875rem',
            color: '#666666',
            fontWeight: '500',
        },
        chartsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
        },
        chartCard: {
            backgroundColor: '#fff',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
        chartTitle: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '1.5rem',
        },
        barChart: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        barRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        barLabel: {
            minWidth: '80px',
            fontWeight: '600',
            color: '#000000',
            fontSize: '14px',
        },
        barContainer: {
            flex: 1,
            height: '32px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden',
        },
        barFill: {
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '8px',
            transition: 'width 0.3s ease',
        },
        barCount: {
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '13px',
        },
        ratingStars: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#000000',
        },
        reviewsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
        },
        reviewItem: {
            padding: '1.25rem',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            backgroundColor: '#fafafa',
            transition: 'all 0.2s',
        },
        reviewHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '0.75rem',
        },
        reviewUser: {
            fontWeight: '600',
            color: '#000000',
            fontSize: '15px',
        },
        reviewDate: {
            fontSize: '13px',
            color: '#999',
        },
        reviewRating: {
            display: 'flex',
            gap: '2px',
            color: '#000000',
            marginBottom: '0.5rem',
        },
        reviewText: {
            color: '#333333',
            fontSize: '14px',
            lineHeight: '1.6',
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
                Loading Analytics...
            </div>
        );
    }

    if (apps.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <button 
                        style={styles.backButton}
                        onClick={onBack}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                    >
                        <HiArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <h1 style={styles.pageTitle}>Analytics</h1>
                </div>
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}><HiChartBar size={48} /></div>
                    <h3>No Apps Published</h3>
                    <p>Publish your first app to see analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button 
                    style={styles.backButton}
                    onClick={onBack}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                >
                    <HiArrowLeft size={20} />
                    Back to Dashboard
                </button>
                <div style={styles.headerTop}>
                    <div>
                        <h1 style={styles.pageTitle}>Analytics Dashboard</h1>
                        <p style={styles.subtitle}>Comprehensive insights for your beta apps</p>
                    </div>
                    <select 
                        style={styles.appSelector}
                        value={selectedApp?._id || ''}
                        onChange={(e) => {
                            const app = apps.find(a => a._id === e.target.value);
                            handleAppChange(app);
                        }}
                    >
                        {apps.map(app => (
                            <option key={app._id} value={app._id}>
                                {app.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div 
                    style={styles.statCard}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={styles.statIcon}>
                        <HiDownload />
                    </div>
                    <div style={styles.statValue}>{analytics.totalDownloads}</div>
                    <div style={styles.statLabel}>Total Downloads</div>
                </div>

                <div 
                    style={styles.statCard}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={styles.statIcon}>
                        <HiUsers />
                    </div>
                    <div style={styles.statValue}>{analytics.totalReviews}</div>
                    <div style={styles.statLabel}>Total Reviews</div>
                </div>

                <div 
                    style={styles.statCard}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={styles.statIcon}>
                        <HiStar />
                    </div>
                    <div style={styles.statValue}>{analytics.averageRating}</div>
                    <div style={styles.statLabel}>Average Rating</div>
                </div>

                <div 
                    style={styles.statCard}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={styles.statIcon}>
                        <HiTrendingUp />
                    </div>
                    <div style={styles.statValue}>
                        {analytics.totalReviews > 0 
                            ? ((analytics.ratingDistribution[4] + analytics.ratingDistribution[5]) / analytics.totalReviews * 100).toFixed(0)
                            : 0}%
                    </div>
                    <div style={styles.statLabel}>Positive Feedback</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={styles.chartsGrid}>
                {/* Rating Distribution Chart */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Rating Distribution</h3>
                    <div style={styles.barChart}>
                        {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} style={styles.barRow}>
                                <div style={styles.barLabel}>
                                    <div style={styles.ratingStars}>
                                        {rating} <HiStar size={16} />
                                    </div>
                                </div>
                                <div style={styles.barContainer}>
                                    <div 
                                        style={{
                                            ...styles.barFill,
                                            width: maxRatingCount > 0 
                                                ? `${(analytics.ratingDistribution[rating] / maxRatingCount) * 100}%`
                                                : '0%'
                                        }}
                                    >
                                        {analytics.ratingDistribution[rating] > 0 && (
                                            <span style={styles.barCount}>
                                                {analytics.ratingDistribution[rating]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Reviews */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Recent Reviews</h3>
                    {analytics.reviews.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No reviews yet</p>
                        </div>
                    ) : (
                        <div style={styles.reviewsList}>
                            {analytics.reviews.slice(0, 5).map((review, index) => (
                                <div 
                                    key={index} 
                                    style={styles.reviewItem}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                        e.currentTarget.style.borderColor = '#000000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fafafa';
                                        e.currentTarget.style.borderColor = '#e5e5e5';
                                    }}
                                >
                                    <div style={styles.reviewHeader}>
                                        <div style={styles.reviewUser}>Beta Tester #{index + 1}</div>
                                        <div style={styles.reviewDate}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={styles.reviewRating}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <div style={styles.reviewText}>
                                        {review.content || review.feedback}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
