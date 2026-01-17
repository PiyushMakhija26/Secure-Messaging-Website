# Secure Messaging - Testing Guide

## ✅ Complete Testing Checklist

### Phase 1: Authentication Testing

#### Test 1.1: User Registration
- [ ] Navigate to http://localhost:3000
- [ ] You should see Login page
- [ ] Click "Register" link
- [ ] Enter credentials:
  - Username: testuser1
  - Email: testuser1@example.com
  - Password: password123
- [ ] Click "Register"
- [ ] Should redirect to dashboard
- [ ] Token should be stored in localStorage

#### Test 1.2: User Login
- [ ] Logout (clear localStorage)
- [ ] Go to Login page
- [ ] Enter credentials:
  - Email: testuser1@example.com
  - Password: password123
- [ ] Click "Login"
- [ ] Should redirect to dashboard with "Your Rooms" section
- [ ] User info should display at top right

#### Test 1.3: Protected Routes
- [ ] Clear localStorage (remove token)
- [ ] Try accessing http://localhost:3000 directly
- [ ] Should redirect to /login
- [ ] Try accessing http://localhost:3000/create-room
- [ ] Should redirect to /login

---

### Phase 2: Room Management Testing

#### Test 2.1: Create Room
- [ ] Login as testuser1
- [ ] Click "+ Create Room"
- [ ] Enter:
  - Room Name: "Test Chat Room 1"
  - Description: "Testing the messaging system"
  - Room Password: "roompass123"
- [ ] Click "Create Room"
- [ ] Should get Room ID (copy this!)
- [ ] Should redirect to chat page
- [ ] Room name should display in header

#### Test 2.2: Register Second User
- [ ] Open new incognito/private browser window
- [ ] Register new user:
  - Username: testuser2
  - Email: testuser2@example.com
  - Password: password456
- [ ] Close window (don't stay logged in)

#### Test 2.3: Join Room with Second User
- [ ] In new incognito window
- [ ] Login as testuser2
- [ ] Click "+ Join Room"
- [ ] Paste the Room ID from Test 2.1
- [ ] Enter Room Password: "roompass123"
- [ ] Click "Join Room"
- [ ] Should be in the same chat room as testuser1
- [ ] Both users should see each other in Members list

#### Test 2.4: List Rooms
- [ ] After joining, go back to dashboard
- [ ] Should see the room listed under "Your Rooms"
- [ ] Should show member count
- [ ] Admin badge should show for testuser1, not testuser2

---

### Phase 3: Real-Time Messaging Testing

#### Test 3.1: Send Messages
- [ ] testuser1 window: Type a message "Hello from User 1"
- [ ] Click Send
- [ ] Message should appear on testuser1's screen immediately
- [ ] testuser2 window: Message should appear in real-time
- [ ] Message should show sender name and timestamp

#### Test 3.2: Bidirectional Messaging
- [ ] testuser2: Type "Hello from User 2"
- [ ] Send message
- [ ] Should appear instantly on both screens
- [ ] Messages should be in order (chronological)

#### Test 3.3: Encryption Verification
- [ ] In browser DevTools (F12) → Network → WS
- [ ] Open chat in testuser1
- [ ] Send message "Secret Message"
- [ ] Check WebSocket message in DevTools
- [ ] The message content should NOT be visible as plain text
- [ ] Should see "encryptedMessage" and "nonce" fields
- [ ] The encryptedMessage should be base64 encoded

#### Test 3.4: Message History
- [ ] testuser1: Refresh page
- [ ] Previous messages should still be visible
- [ ] Messages should be decrypted on load

#### Test 3.5: Typing Indicator
- [ ] testuser1: Start typing in message box
- [ ] testuser2: Should see "testuser1 is typing..." indicator
- [ ] testuser1: Stop typing
- [ ] Indicator should disappear

---

### Phase 4: Session Management Testing

#### Test 4.1: End Session
- [ ] testuser1: Click "End Session" button in chat header
- [ ] Confirm action when prompted
- [ ] Alert should say "Session ended. All messages have been deleted."
- [ ] All messages should disappear from both users' screens
- [ ] testuser2: Should see messages cleared
- [ ] Room should still exist (can still chat)

#### Test 4.2: Send Messages After Session End
- [ ] testuser1: Type new message "This is a new message"
- [ ] Send message
- [ ] Should work normally
- [ ] testuser2: Should receive the new message
- [ ] Message history should only contain messages after session end

#### Test 4.3: Join New Room After Session End
- [ ] testuser1: Create another room "Test Room 2"
- [ ] Get Room ID
- [ ] testuser2: Join this new room
- [ ] Both should be able to chat in new room

---

### Phase 5: Edge Cases & Error Handling

#### Test 5.1: Invalid Room Password
- [ ] testuser2: Click "+ Join Room"
- [ ] Enter valid Room ID
- [ ] Enter wrong password
- [ ] Should show error: "Invalid room password"
- [ ] Should not join room

#### Test 5.2: Non-Existent Room
- [ ] testuser2: Click "+ Join Room"
- [ ] Enter fake Room ID "invalid-id-123"
- [ ] Enter any password
- [ ] Should show error: "Room not found"

#### Test 5.3: Token Expiration
- [ ] Open DevTools Console
- [ ] Clear localStorage
- [ ] Try creating a room or joining
- [ ] Should redirect to login
- [ ] Login again should work

#### Test 5.4: Leave Room
- [ ] testuser2: Click "Leave Room"
- [ ] Should redirect to dashboard
- [ ] Room should no longer show in "Your Rooms"
- [ ] testuser1: testuser2 should disappear from members list

---

### Phase 6: Multi-Room Testing

#### Test 6.1: Multiple Rooms
- [ ] testuser1: Create 3 different rooms
- [ ] testuser2: Join all 3 rooms
- [ ] Switch between rooms
- [ ] Send different messages in each room
- [ ] Verify each room has separate message histories

#### Test 6.2: Room Admin Controls
- [ ] testuser1 (admin): Open room and see member removal button
- [ ] testuser2 (non-admin): Should NOT see member removal option

---

### Phase 7: Performance & Stability

#### Test 7.1: Rapid Message Sending
- [ ] Send 50 messages rapidly
- [ ] All should be delivered and decrypted
- [ ] No crashes or disconnections

#### Test 7.2: Long Message
- [ ] Send a very long message (1000+ characters)
- [ ] Should encrypt and transmit without issues

#### Test 7.3: Multiple Users (Bonus)
- [ ] Open 3+ browser windows with different users
- [ ] Send messages in a group chat
- [ ] All should receive all messages instantly
- [ ] Verify encryption with DevTools

---

## Expected Results Summary

✅ **Authentication**: Users should be able to register, login, and access protected routes  
✅ **Rooms**: Create rooms with unique IDs and passwords, join with correct credentials  
✅ **Messaging**: Send and receive messages in real-time  
✅ **Encryption**: Messages encrypted before transmission, decrypted on client  
✅ **Sessions**: End session deletes all messages, room persists  
✅ **Scalability**: Multiple users and rooms work correctly  

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid token" on room creation | Clear localStorage, logout and login again |
| Messages not appearing | Check WebSocket connection in DevTools |
| Encryption fails | Ensure both users have valid keypairs |
| Can't join room | Verify Room ID and password are correct |
| Session won't end | Check if user is authenticated (token valid) |

---

## Browser DevTools Debugging

**To view encrypted messages in WebSocket:**
1. Press F12 → Network tab
2. Filter for "WS" (WebSocket)
3. Click on the WebSocket connection
4. Go to "Messages" tab
5. Look for messages with structure:
```json
{
  "type": "chat-message",
  "encryptedMessage": "base64encodedstring...",
  "nonce": "base64encodedstring...",
  "userId": "..."
}
```

This confirms messages are truly encrypted!
