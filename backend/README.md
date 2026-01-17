# Secure Messaging Backend

End-to-End Encrypted Messaging System Backend

## Features

- User authentication with JWT
- Room creation and management with admin controls
- Password-protected rooms with unique IDs
- E2E encryption using TweetNaCl
- Real-time messaging via WebSocket
- Message history storage (encrypted)
- Server never reads message content

## Setup

### Prerequisites
- Node.js v14+
- MongoDB

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/secure-messaging
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
NODE_ENV=development
```

### Running

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Rooms
- `POST /api/rooms/create` - Create new room (requires auth)
- `POST /api/rooms/join` - Join a room (requires room password)
- `GET /api/rooms/:roomId` - Get room details (members only)
- `GET /api/rooms/:roomId/messages` - Get message history (members only)
- `GET /api/rooms/list/myrooms` - List user's rooms (requires auth)
- `POST /api/rooms/:roomId/remove-member` - Remove member (admin only)

### Users
- `GET /api/users/:userId/public-key` - Get user's public key
- `GET /api/users/profile/me` - Get current user profile (requires auth)

## WebSocket Events

### Client to Server
- `join-room` - Join a room for real-time messaging
- `chat-message` - Send encrypted message
- `user-typing` - Indicate user is typing

### Server to Client
- `chat-message` - Receive encrypted message
- `user-joined` - User joined the room
- `user-left` - User left the room
- `user-typing` - User is typing indicator

## Encryption Details

- Algorithm: TweetNaCl (libsodium.js port)
- Each user has a keypair: public key (shared) and secret key (private)
- Messages are encrypted with recipient's public key
- Server stores only encrypted data and nonce
- Decryption happens only on client-side

## Database Models

### User
- username (unique)
- email (unique)
- passwordHash (bcrypted)
- publicKey (base64 encoded)

### Room
- roomId (UUID)
- name
- description
- adminId (references User)
- passwordHash (bcrypted)
- members (array of userId references)

### Message
- roomId (references Room)
- userId (references User)
- encryptedContent (never decrypted on server)
- nonce (for decryption)
- senderPublicKey
- createdAt

## Security Considerations

1. **Passwords**: Hashed with bcrypt (user passwords and room passwords)
2. **Tokens**: JWT with secret key
3. **Encryption**: TweetNaCl box encryption (asymmetric)
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Configure appropriately for your frontend domain
6. **Message Storage**: Only encrypted content is stored
