import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { getUser } from '../utils/auth';

const ChatPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const currentUser = getUser();
    const messagesEndRef = useRef(null);
    const [recipientName, setRecipientName] = useState('');
    
    // Get app context from URL params
    const appId = searchParams.get('appId');
    const appTitle = searchParams.get('appTitle');

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling for new messages
        return () => clearInterval(interval);
    }, [userId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await chatAPI.getMessages(userId);
            if (response.success) {
                setMessages(response.messages);
                // Try to find recipient name from messages
                if (response.messages.length > 0) {
                    const firstMsg = response.messages[0];
                    const otherUser = firstMsg.sender._id === currentUser.id
                        ? firstMsg.recipient
                        : firstMsg.sender;
                    setRecipientName(otherUser.fullName);
                } else {
                    // If no messages, we might not know the name easily unless we fetch User details separately
                    // But usually we come here from Reviews Page which had the user.
                    // For now, default to "User" if empty history
                    setRecipientName('User');
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await chatAPI.sendMessage({
                recipientId: userId,
                content: newMessage,
                appId: appId || undefined
            });
            setNewMessage('');
            fetchMessages(); // Refresh immediately
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const styles = {
        container: {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f3f4f6',
            fontFamily: "'Inter', sans-serif",
        },
        header: {
            padding: '1rem 2rem',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
        headerTop: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        appContext: {
            fontSize: '0.85rem',
            color: '#6b7280',
            paddingLeft: '2.5rem',
        },
        backBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            transition: 'background 0.2s',
        },
        userName: {
            fontWeight: '600',
            fontSize: '1.1rem',
            color: '#111827',
        },
        chatArea: {
            flex: 1,
            padding: '2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        messageBubble: {
            maxWidth: '70%',
            padding: '0.8rem 1.2rem',
            borderRadius: '16px',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            position: 'relative',
        },
        sent: {
            alignSelf: 'flex-end',
            backgroundColor: '#000',
            color: '#fff',
            borderBottomRightRadius: '4px',
        },
        received: {
            alignSelf: 'flex-start',
            backgroundColor: '#fff',
            color: '#1f2937',
            borderBottomLeftRadius: '4px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        },
        inputArea: {
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderTop: '1px solid #e5e7eb',
        },
        form: {
            display: 'flex',
            gap: '1rem',
            maxWidth: '1000px',
            margin: '0 auto',
        },
        input: {
            flex: 1,
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
        },
        sendBtn: {
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            padding: '0 2rem',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
        },
    };

    if (loading && messages.length === 0) return <div style={{ padding: '2rem' }}>Loading chat...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerTop}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
                    <div style={styles.userName}>{recipientName}</div>
                </div>
                {appTitle && (
                    <div style={styles.appContext}>
                        💬 Conversation about: <strong>{appTitle}</strong>
                    </div>
                )}
            </header>

            <div style={styles.chatArea}>
                {messages.map((msg, index) => {
                    const isMe = msg.sender._id === currentUser.id;
                    return (
                        <div
                            key={index}
                            style={{
                                ...styles.messageBubble,
                                ...(isMe ? styles.sent : styles.received)
                            }}
                        >
                            {msg.content}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
                <form style={styles.form} onSubmit={handleSend}>
                    <input
                        style={styles.input}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button style={styles.sendBtn} type="submit">Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
