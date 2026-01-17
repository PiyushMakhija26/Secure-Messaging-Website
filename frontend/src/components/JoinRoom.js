import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APIClient from '../utils/APIClient';
import '../styles/RoomManagement.css';

function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await APIClient.joinRoom(roomId, password);
      navigate(`/chat/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-container">
      <div className="room-box">
        <h1>Join Room</h1>
        <form onSubmit={handleJoinRoom}>
          <div className="form-group">
            <label>Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              placeholder="Enter the room ID"
            />
            <small>Ask the room admin for the ID</small>
          </div>
          <div className="form-group">
            <label>Room Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter room password"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinRoom;
