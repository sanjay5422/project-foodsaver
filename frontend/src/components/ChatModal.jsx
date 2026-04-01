import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socket from '../services/socketService';
import { useAuth } from '../context/AuthContext';

const ChatModal = ({ request, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Join socket room
        socket.emit('join_chat', request._id);

        // Fetch message history
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/chat/${request._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data.data || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        // Listen for new messages
        const handleReceiveMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.emit('leave_chat', request._id);
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [request._id]);

    useEffect(() => {
        // Auto-scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            requestId: request._id,
            senderId: user._id,
            message: newMessage
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const isProvider = user.role === 'Provider';
    const otherPartyName = isProvider ? request.recipientId?.name : request.providerId?.name;

    return (
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
            <div className="modal-content" style={{ width: '90%', maxWidth: '500px', height: '600px', display: 'flex', flexDirection: 'column', padding: '0' }}>

                {/* Header */}
                <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ff6b35', color: 'white', borderRadius: '8px 8px 0 0' }}>
                    <h3 style={{ margin: 0 }}>Chat with {otherPartyName}</h3>
                    <span className="close" onClick={onClose} style={{ color: 'white', opacity: 0.8, marginTop: '-5px' }}>&times;</span>
                </div>

                {/* Messages Flow */}
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No messages yet. Start the conversation!</p>
                    ) : (
                        messages.map((msg, index) => {
                            const isMine = msg.senderId === user._id;
                            return (
                                <div key={index} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <div style={{
                                        padding: '8px 12px',
                                        borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                        backgroundColor: isMine ? '#ff6b35' : '#e5e7eb',
                                        color: isMine ? 'white' : '#374151',
                                        marginBottom: '2px',
                                        wordBreak: 'break-word'
                                    }}>
                                        {msg.message}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: isMine ? 'right' : 'left' }}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '10px', backgroundColor: 'white', borderRadius: '0 0 8px 8px' }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #d1d5db', outline: 'none' }}
                    />
                    <button
                        type="submit"
                        style={{ padding: '10px 20px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                        disabled={!newMessage.trim()}
                    >
                        Send
                    </button>
                </form>

            </div>
        </div>
    );
};

export default ChatModal;
