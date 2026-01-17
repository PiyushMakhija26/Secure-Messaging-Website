import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import APIClient from '../utils/APIClient';
import '../styles/Chat.css';

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [room, setRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wsReady, setWsReady] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const connectWebSocket = (user) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:5000`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected, ready state:', wsRef.current.readyState);
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log('Sending join-room message');
          wsRef.current.send(JSON.stringify({
            type: 'join-room',
            roomId: roomId,
            userId: user.id
          }));
          setWsReady(true);
        } else {
          console.error('WebSocket not in OPEN state:', wsRef.current?.readyState);
          setWsReady(false);
        }
      } catch (err) {
        console.error('Error in onopen:', err);
        setWsReady(false);
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Message received:', data);
        if (data.type === 'chat-message') {
          // Only add if not already in messages (avoid duplicates)
          setMessages(prev => {
            const messageExists = prev.some(
              m => m.userId === data.userId && 
                   m.content === data.content && 
                   m.timestamp === data.timestamp
            );
            if (messageExists) {
              console.log('Message already exists, skipping duplicate');
              return prev;
            }
            return [...prev, {
              ...data,
              sender: data.username || data.sender || 'User',
              content: data.content
            }];
          });
        } else if (data.type === 'user-joined') {
          console.log('User joined:', data.userId);
        } else if (data.type === 'user-left') {
          console.log('User left:', data.userId);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsReady(false);
      setError('Failed to connect to chat');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
      setWsReady(false);
    };
  };

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const userResponse = await APIClient.getMyProfile();
        setCurrentUser(userResponse.data);

        try {
          const roomResponse = await APIClient.getRoomDetails(roomId);
          setRoom(roomResponse.data);

          const messagesResponse = await APIClient.getMessageHistory(roomId);
          setMessages(messagesResponse.data.messages || []);
          
          setLoading(false);
          connectWebSocket(userResponse.data);
        } catch (roomErr) {
          // User might not be a member - show password prompt
          if (roomErr.response?.status === 403) {
            setLoading(false);
            setNeedsPassword(true);
          } else {
            throw roomErr;
          }
        }
      } catch (err) {
        console.error('Room init error:', err);
        setError(err.response?.data?.error || 'Failed to load');
        setLoading(false);
      }
    };

    initializeRoom();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinWithPassword = async (e) => {
    e.preventDefault();
    try {
      const userResponse = await APIClient.getMyProfile();
      await APIClient.joinRoom(roomId, passwordInput);
      
      const roomResponse = await APIClient.getRoomDetails(roomId);
      setRoom(roomResponse.data);

      const messagesResponse = await APIClient.getMessageHistory(roomId);
      setMessages(messagesResponse.data.messages || []);
      
      setNeedsPassword(false);
      connectWebSocket(userResponse);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) {
      return;
    }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket state:', wsRef.current?.readyState, 'OPEN=', WebSocket.OPEN);
      alert('Still connecting to chat. Please wait...');
      return;
    }
    console.log('Sending message:', messageInput);
    const messageData = {
      type: 'chat-message',
      roomId,
      userId: currentUser.id,
      username: currentUser.username,
      content: messageInput,
      sender: currentUser.username,
      timestamp: new Date()
    };
    console.log('Sending:', messageData);
    wsRef.current.send(JSON.stringify(messageData));
    setMessageInput('');
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/chat/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setShareMessage('Link copied to clipboard!');
    setTimeout(() => setShareMessage(''), 3000);
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure? This will delete the entire room and all messages.')) return;
    
    setDeleteLoading(true);
    try {
      await APIClient.deleteRoom(roomId);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete room');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="chat-container"><p>Loading...</p></div>;
  
  if (needsPassword) {
    return (
      <div className="chat-container">
        <div className="password-prompt">
          <h2>Join Room</h2>
          <p>Enter the room password to join</p>
          <form onSubmit={handleJoinWithPassword}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter room password"
              required
            />
            <button type="submit">Join Room</button>
            <button type="button" onClick={() => navigate('/')}>Cancel</button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  if (error) return <div className="chat-container"><p className="error-message">{error}</p></div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h2>{room?.name}</h2>
          <p className="room-id">{room?.roomId}</p>
        </div>
        <div className="header-buttons">
          {shareMessage && <span className="share-success">{shareMessage}</span>}
          <button onClick={handleShareLink} className="share-btn">📋 Share Link</button>
          {currentUser && room?.adminId === currentUser.id && (
            <button onClick={handleDeleteRoom} disabled={deleteLoading} className="delete-btn">
              {deleteLoading ? 'Deleting...' : '🗑️ Delete Room'}
            </button>
          )}
          <button onClick={() => navigate('/')}>← Back</button>
        </div>
      </div>

      <div className="messages-area">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <strong>{msg.username || msg.sender || 'User'}</strong>: {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <input 
          value={messageInput} 
          onChange={(e) => setMessageInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
          placeholder={wsReady ? "Message..." : "Connecting..."} 
          disabled={!wsReady}
        />
        <button onClick={handleSendMessage} disabled={!wsReady}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
