import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import APIClient from '../utils/APIClient';
import '../styles/Dashboard.css';

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const userResponse = await APIClient.getMyProfile();
        setUser(userResponse.data);

        const roomsResponse = await APIClient.getMyRooms();
        setRooms(roomsResponse.data.rooms || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load rooms');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="dashboard"><p>Loading...</p></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Secure Messaging</h1>
          <p className="tagline">End-to-End Encrypted Rooms</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <p>{user?.username}</p>
            <small>{user?.email}</small>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="action-buttons">
          <button 
            onClick={() => navigate('/create-room')}
            className="btn btn-primary"
          >
            + Create Room
          </button>
          <button 
            onClick={() => navigate('/join-room')}
            className="btn btn-secondary"
          >
            + Join Room
          </button>
        </div>

        <div className="features-section">
          <h3>About Secure Messaging</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <div className="feature-tooltip">End-to-End Encrypted - Server never reads your messages</div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔑</span>
              <div className="feature-tooltip">Unique Room IDs - Share with others to invite them</div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <div className="feature-tooltip">Password Protected - Only those with password can join</div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div className="feature-tooltip">Room Admin Control - Manage members and settings</div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <div className="feature-tooltip">Real-Time Messaging - Instant encrypted communication</div>
            </div>
          </div>
        </div>

        <div className="rooms-section">
          <h2>Your Rooms ({rooms.length})</h2>
          {error && <div className="error-message">{error}</div>}
          
          {rooms.length === 0 ? (
            <div className="empty-state">
              <p>No rooms yet. Create one or join an existing room!</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map(room => (
                <div key={room.id} className="room-card">
                  <div className="room-card-header">
                    <h3>{room.name}</h3>
                    {room.isAdmin && <span className="admin-badge">Admin</span>}
                  </div>
                  <div className="room-card-body">
                    <p className="room-id">ID: {room.roomId}</p>
                    <p className="member-count">Members: {room.memberCount}</p>
                    <p className="created-date">
                      Created: {new Date(room.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/chat/${room.roomId}`)}
                    className="room-card-btn"
                  >
                    Enter Room
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
