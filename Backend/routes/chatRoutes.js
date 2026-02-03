const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private
router.get('/conversations/list', authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.userId;

        // Get all messages where user is sender or recipient
        const messages = await Message.find({
            $or: [
                { sender: currentUserId },
                { recipient: currentUserId }
            ]
        })
            .populate('sender', 'fullName email')
            .populate('recipient', 'fullName email')
            .populate('app', 'title')
            .sort({ createdAt: -1 });

        // Group messages by conversation partner
        const conversationsMap = new Map();
        
        messages.forEach(msg => {
            const partnerId = msg.sender._id.toString() === currentUserId.toString() 
                ? msg.recipient._id.toString() 
                : msg.sender._id.toString();
            
            if (!conversationsMap.has(partnerId)) {
                const partner = msg.sender._id.toString() === currentUserId.toString() 
                    ? msg.recipient 
                    : msg.sender;
                
                conversationsMap.set(partnerId, {
                    partner: {
                        id: partner._id,
                        fullName: partner.fullName,
                        email: partner.email
                    },
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    app: msg.app ? { id: msg.app._id, title: msg.app.title } : null,
                    unreadCount: 0
                });
            }
            
            // Count unread messages from partner
            if (msg.recipient._id.toString() === currentUserId.toString() && !msg.read) {
                const conv = conversationsMap.get(partnerId);
                conv.unreadCount++;
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/chat/:userId
// @desc    Get conversation between current user and specified user
// @access  Private
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
            ]
        })
            .sort({ createdAt: 1 }) // Oldest to newest
            .populate('sender', 'fullName')
            .populate('recipient', 'fullName')
            .populate('app', 'title');

        // Mark messages from other user as read
        await Message.updateMany(
            { 
                sender: otherUserId, 
                recipient: currentUserId, 
                read: false 
            },
            { read: true }
        );

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/chat
// @desc    Send a message
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { recipientId, content, appId } = req.body;
        const senderId = req.userId;

        const message = new Message({
            sender: senderId,
            recipient: recipientId,
            content,
            app: appId || null
        });

        await message.save();

        // Populate to return full info immediately if needed
        await message.populate('sender', 'fullName');
        await message.populate('recipient', 'fullName');
        if (appId) {
            await message.populate('app', 'title');
        }

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
