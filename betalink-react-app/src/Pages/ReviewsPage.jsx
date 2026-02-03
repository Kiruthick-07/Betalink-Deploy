import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import { getUser } from '../utils/auth';

const ReviewsPage = () => {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = getUser();

    // State for creating a review (if tester)
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, content: '' });

    useEffect(() => {
        fetchReviews();
    }, [appId]);

    const fetchReviews = async () => {
        try {
            const response = await reviewAPI.getReviews(appId);
            if (response.success) {
                setReviews(response.reviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContact = (testerId) => {
        navigate(`/chat/${testerId}`);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await reviewAPI.addReview({ ...newReview, appId });
            setNewReview({ rating: 5, content: '' });
            setShowReviewForm(false);
            fetchReviews();
        } catch (error) {
            alert('Failed to submit review');
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#fff',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
        },
        backBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: '700',
        },
        reviewList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
        },
        reviewCard: {
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'relative',
        },
        reviewHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
        },
        userInfo: {
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
        },
        avatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.9rem',
        },
        userName: {
            fontWeight: '600',
            color: '#1f2937',
        },
        rating: {
            color: '#fbbf24', // Star color
            fontWeight: 'bold',
        },
        content: {
            color: '#4b5563',
            lineHeight: '1.6',
            marginBottom: '1rem',
        },
        contactBtn: {
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginLeft: 'auto',
            display: 'block',
        },
        addReviewBtn: {
            backgroundColor: '#000',
            color: '#fff',
            padding: '1rem',
            width: '100%',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '2rem',
            fontWeight: '600',
        },
        reviewForm: {
            marginBottom: '2rem',
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
        },
        textarea: {
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            marginBottom: '1rem',
            minHeight: '100px',
        },
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>←</button>
                <h1 style={styles.title}>App Reviews</h1>
            </header>

            {/* If user is tester/client, allow adding review */}
            {user?.role === 'client' && (
                <>
                    {!showReviewForm ? (
                        <button style={styles.addReviewBtn} onClick={() => setShowReviewForm(true)}>
                            Write a Review
                        </button>
                    ) : (
                        <form style={styles.reviewForm} onSubmit={handleSubmitReview}>
                            <h3 style={{ marginBottom: '1rem' }}>Write your feedback</h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ marginRight: '10px' }}>Rating:</label>
                                <select
                                    value={newReview.rating}
                                    onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                    style={{ padding: '5px', borderRadius: '4px' }}
                                >
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                </select>
                            </div>
                            <textarea
                                style={styles.textarea}
                                placeholder="Share your experience..."
                                value={newReview.content}
                                onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                                required
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="submit"
                                    style={{ ...styles.contactBtn, marginLeft: 0, width: 'fix-content' }}
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    style={{ ...styles.contactBtn, marginLeft: 0, backgroundColor: '#ddd', color: '#000' }}
                                    onClick={() => setShowReviewForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}

            <div style={styles.reviewList}>
                {reviews.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999' }}>No reviews yet.</p>
                ) : reviews.map(review => (
                    <div key={review._id} style={styles.reviewCard}>
                        <div style={styles.reviewHeader}>
                            <div style={styles.userInfo}>
                                <div style={styles.avatar}>
                                    {review.tester?.fullName?.charAt(0) || 'U'}
                                </div>
                                <span style={styles.userName}>{review.tester?.fullName || 'Unknown User'}</span>
                            </div>
                            <span style={styles.rating}>{'★'.repeat(review.rating)}</span>
                        </div>
                        <p style={styles.content}>{review.content}</p>

                        {/* Only Developer can contact Tester */}
                        {user?.role === 'developer' && (
                            <button
                                style={styles.contactBtn}
                                onClick={() => handleContact(review.tester._id)}
                            >
                                Contact Tester
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsPage;
