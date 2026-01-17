# Secure Messaging Website - Full Stack

A complete end-to-end encrypted messaging platform built with modern web technologies. Create secure rooms, invite people, and chat with military-grade encryption where the server never reads your messages.

## Features

### Core Features
- **End-to-End Encryption (E2E)**: Messages are encrypted using TweetNaCl and decrypted only on the client side
- **Unique Room IDs**: Each room has a unique UUID identifier that can be shared with others
- **Password Protected**: Rooms require a password to join, set by the admin
- **Admin Controls**: Room creators have admin privileges to manage members
- **Real-Time Messaging**: WebSocket-based instant messaging
- **User Authentication**: JWT-based secure authentication
- **Message History**: Access to message history (only visible after decryption)

### Security Features
- Server stores only encrypted messages and nonce values
- Asymmetric encryption using TweetNaCl box (libsodium port)
- Password hashing with bcrypt for both users and rooms
- JWT tokens for session management
- HTTPS ready (configure in production)

## Project Structure

```
messaging-website/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema and methods
│   │   ├── Room.js          # Room schema with admin controls
│   │   └── Message.js       # Message storage (encrypted)
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── rooms.js         # Room management endpoints
│   │   └── users.js         # User profile endpoints
│   ├── server.js            # Express server with WebSocket
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Environment variables template
│   └── README.md            # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js           # Login component
│   │   │   ├── Register.js        # Registration component
│   │   │   ├── Dashboard.js       # Main dashboard
│   │   │   ├── ChatRoom.js        # Chat interface
│   │   │   ├── CreateRoom.js      # Room creation
│   │   │   ├── JoinRoom.js        # Room joining
│   │   │   └── ProtectedRoute.js  # Route protection
│   │   ├── utils/
│   │   │   ├── EncryptionManager.js  # E2E encryption logic
│   │   │   └── APIClient.js          # API communication
│   │   ├── styles/
│   │   │   ├── index.css         # Global styles
│   │   │   ├── Auth.css          # Auth pages styles
│   │   │   ├── Dashboard.css     # Dashboard styles
│   │   │   ├── RoomManagement.css  # Room pages styles
│   │   │   └── Chat.css          # Chat interface styles
│   │   ├── App.js                # Main app component
│   │   └── index.js              # React entry point
│   ├── public/
│   │   └── index.html        # HTML entry point
│   ├── package.json          # Frontend dependencies
│   └── README.md             # Frontend documentation
│
└── README.md                 # This file
```

## Installation & Setup

### Prerequisites
- Node.js v14+
- MongoDB (local or remote)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Configure MongoDB connection** (edit `.env`)
```
MONGODB_URI=mongodb://localhost:27017/secure-messaging
JWT_SECRET=change-this-to-random-key-in-production
PORT=5000
NODE_ENV=development
```

5. **Start MongoDB**
```bash
# On Windows with MongoDB installed
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

6. **Start the backend server**
```bash
npm run dev      # Development with auto-reload
npm start        # Production
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** (optional, defaults to localhost)
```bash
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

4. **Start development server**
```bash
npm start        # Dev mode with hot reload
npm run build    # Production build
```

Frontend will run on `http://localhost:3000`

## How to Use

### Creating an Account
1. Go to the Register page
2. Create a username, email, and password
3. System automatically generates encryption keypair for your account

### Creating a Room
1. Click "Create Room" on the dashboard
2. Enter room name, description (optional), and set a password
3. You'll be the admin of this room
4. Share the Room ID with others to invite them

### Joining a Room
1. Click "Join Room" on the dashboard
2. Enter the Room ID shared by the admin
3. Enter the room password
4. You'll be added as a member and can start chatting

### Chatting Securely
1. Click on a room to enter
2. See all members on the right panel
3. Type a message and click "Send"
4. Messages are encrypted before being sent
5. Only members with their private keys can decrypt

### Admin Controls
As a room admin, you can:
- View all members
- Remove members from the room
- See message history (encrypted on server, decrypted on client)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Rooms
- `POST /api/rooms/create` - Create new room
- `POST /api/rooms/join` - Join a room
- `GET /api/rooms/:roomId` - Get room details
- `GET /api/rooms/:roomId/messages` - Get message history
- `GET /api/rooms/list/myrooms` - List user's rooms
- `POST /api/rooms/:roomId/remove-member` - Remove member (admin only)

### Users
- `GET /api/users/:userId/public-key` - Get user's public key
- `GET /api/users/profile/me` - Get current user profile

## WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId, userId }` | Join a room for real-time chat |
| `chat-message` | `{ encryptedMessage, nonce, userId }` | Send encrypted message |
| `user-typing` | `{ userId, roomId }` | Indicate typing status |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `chat-message` | Encrypted message data | Receive message from another user |
| `user-joined` | `{ userId, timestamp }` | User joined the room |
| `user-left` | `{ userId, timestamp }` | User left the room |
| `user-typing` | `{ userId }` | User is typing indicator |

## Encryption Details

### Algorithm
- **Type**: Asymmetric encryption
- **Library**: TweetNaCl.js (libsodium port)
- **Cipher**: NaCl box (Curve25519, Salsa20, Poly1305)
- **Key Size**: 256-bit keys

### Key Exchange
1. Each user has a keypair: public key (shared) and secret key (private)
2. Public keys are stored on the server (non-sensitive)
3. Secret keys stay only on the client
4. Messages encrypted with recipient's public key
5. Only recipient's secret key can decrypt

### Message Flow
1. User types message
2. Frontend encrypts with recipient's public key
3. Nonce generated for each message
4. Encrypted content + nonce sent to server
5. Server relays to recipient (no decryption)
6. Recipient decrypts using own secret key
7. Original message is only decrypted on client side

## Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  passwordHash: String (bcrypted),
  publicKey: String (base64),
  createdAt: Date
}
```

### Room
```javascript
{
  roomId: String (UUID, unique),
  name: String,
  description: String,
  adminId: ObjectId (references User),
  passwordHash: String (bcrypted),
  members: [
    {
      userId: ObjectId,
      joinedAt: Date
    }
  ],
  encryptionType: String (default: 'tweetnacl'),
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  roomId: ObjectId (references Room),
  userId: ObjectId (references User),
  encryptedContent: String (base64),
  nonce: String (base64),
  senderPublicKey: String (base64),
  createdAt: Date
}
```

## Security Considerations

### Production Deployment
1. **HTTPS Only**: Always use HTTPS in production
2. **Secure JWT Secret**: Change the JWT_SECRET to a random, strong key
3. **Environment Variables**: Keep sensitive data in `.env` files (not in Git)
4. **CORS Configuration**: Set appropriate CORS origins for your domain
5. **Rate Limiting**: Implement rate limiting on authentication endpoints
6. **Input Validation**: All inputs are validated on the server
7. **Password Policies**: Enforce strong passwords in production

### Client-Side Security
1. **Private Key Storage**: Currently stored in sessionStorage (use IndexedDB for persistence)
2. **HTTPS**: Encrypt all communication with SSL/TLS
3. **CSP Headers**: Implement Content Security Policy headers
4. **XSS Protection**: All outputs are escaped in React

### Known Limitations
1. Private keys are generated client-side but not persisted across sessions
2. For production: implement secure key backup/recovery mechanisms
3. Room passwords are bcrypted on server (can't be recovered if forgotten)
4. Message history can be deleted, implement retention policies as needed

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify MongoDB URI in `.env`
- Check port 5000 is not in use

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS configuration in `server.js`
- Verify API_URL in frontend APIClient.js

### Messages won't send
- Check WebSocket connection (browser DevTools)
- Verify user is authenticated (token in localStorage)
- Check browser console for encryption errors

### Can't decrypt messages
- Ensure users' public keys are loaded
- Check that message nonce is correct
- Verify encryption library is initialized

## Development Tips

### Testing Locally
1. Open two browser windows
2. Register two different users
3. Create a room with first user
4. Join with second user using Room ID and password
5. Send messages between users

### Debugging
- **Backend**: Use `console.log()` or VS Code debugger
- **Frontend**: React DevTools browser extension
- **Encryption**: Check browser console for decryption errors
- **WebSocket**: Use DevTools Network → WS tab

## Future Enhancements

- [ ] File sharing with E2E encryption
- [ ] Voice/video calling
- [ ] User presence indicators
- [ ] Message search (on encrypted data)
- [ ] User profiles with avatars
- [ ] Message reactions and replies
- [ ] Dark mode
- [ ] Two-factor authentication
- [ ] Message read receipts
- [ ] Group notifications
- [ ] Mobile app (React Native)
- [ ] Key backup and recovery

## License

MIT License - Feel free to use for personal and commercial projects

## Support

For issues, questions, or suggestions, please create an issue in the project repository.

## Security Audit

⚠️ **Note**: This project is a demonstration of E2E encryption concepts. Before using in production with sensitive data, consider:
- Professional security audit
- Compliance with regulations (GDPR, HIPAA, etc.)
- Regular security updates
- Bug bounty program

Enjoy secure messaging! 🔐
