import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APIClient from '../utils/APIClient';
import '../styles/RoomManagement.css';

function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        setLoading(false);
        return;
      }

      const response = await APIClient.createRoom(roomName, description, password);
      const roomId = response.data.room.roomId;
      navigate(`/chat/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-container">
      <div className="room-box">
        <h1>Create New Room</h1>
        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              placeholder="Enter room name"
            />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Room description"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Room Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Set room password"
            />
            <small>Others will need this password to join</small>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm password"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;
