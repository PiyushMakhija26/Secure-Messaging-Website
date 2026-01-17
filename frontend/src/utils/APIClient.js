import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request to:', config.url, 'Token:', token ? 'YES' : 'NO');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    if (token) {
      this.token = token;
      localStorage.setItem('token', token);
      // Update the interceptor headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set:', token.substring(0, 20) + '...');
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Auth endpoints
  register(username, email, password) {
    return axiosInstance.post('/auth/register', {
      username,
      email,
      password
    });
  }

  login(email, password) {
    return axiosInstance.post('/auth/login', {
      email,
      password
    });
  }

  verifyToken() {
    return axiosInstance.get('/auth/verify');
  }

  // Room endpoints
  createRoom(name, description, password) {
    return axiosInstance.post('/rooms/create', {
      name,
      description,
      password
    });
  }

  joinRoom(roomId, password) {
    return axiosInstance.post('/rooms/join', {
      roomId,
      password
    });
  }

  getRoomDetails(roomId) {
    return axiosInstance.get(`/rooms/${roomId}`);
  }

  getMessageHistory(roomId) {
    return axiosInstance.get(`/rooms/${roomId}/messages`);
  }

  getMyRooms() {
    return axiosInstance.get('/rooms/list/myrooms');
  }

  removeMember(roomId, memberId) {
    return axiosInstance.post(`/rooms/${roomId}/remove-member`, {
      memberId
    });
  }

  endSession(roomId) {
    return axiosInstance.post(`/rooms/${roomId}/end-session`, {});
  }

  deleteRoom(roomId) {
    return axiosInstance.delete(`/rooms/${roomId}`);
  }

  // User endpoints
  getUserPublicKey(userId) {
    return axiosInstance.get(`/users/${userId}/public-key`);
  }

  getMyProfile() {
    return axiosInstance.get('/users/profile/me');
  }
}

const apiClient = new APIClient();
export default apiClient;
