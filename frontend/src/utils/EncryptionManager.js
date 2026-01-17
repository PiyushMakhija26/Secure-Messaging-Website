import nacl from 'tweetnacl';

// Browser-safe base64 encoding
const bytesToBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBytes = (str) => {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// Utility functions for UTF8 encoding/decoding
const decodeUTF8 = (arr) => {
  const decoder = new TextDecoder();
  return decoder.decode(arr);
};

const encodeUTF8 = (str) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

class EncryptionManager {
  constructor() {
    this.keyPair = null;
    this.publicKeysMap = new Map(); // userId -> publicKey
  }

  // Generate a new keypair for the user
  generateKeyPair() {
    this.keyPair = nacl.box.keyPair();
    return {
      publicKey: this.keyPair.publicKey,
      secretKey: this.keyPair.secretKey
    };
  }

  // Get public key as base64 for transmission
  getPublicKeyBase64() {
    if (!this.keyPair) throw new Error('Keypair not initialized');
    return bytesToBase64(this.keyPair.publicKey);
  }

  // Load a public key from another user
  addPublicKey(userId, publicKeyBase64) {
    const publicKey = base64ToBytes(publicKeyBase64);
    this.publicKeysMap.set(userId, publicKey);
  }

  // Encrypt a message for a specific user
  encryptMessage(message, recipientPublicKeyBase64) {
    if (!this.keyPair) throw new Error('Keypair not initialized');

    const recipientPublicKey = base64ToBytes(recipientPublicKeyBase64);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    
    const messageUint8 = encodeUTF8(message);
    const encrypted = nacl.box(
      messageUint8,
      nonce,
      recipientPublicKey,
      this.keyPair.secretKey
    );

    return {
      encryptedContent: bytesToBase64(encrypted),
      nonce: bytesToBase64(nonce)
    };
  }

  // Decrypt a message
  decryptMessage(encryptedContentBase64, nonceBase64, senderPublicKeyBase64) {
    if (!this.keyPair) throw new Error('Keypair not initialized');

    try {
      const encryptedContent = base64ToBytes(encryptedContentBase64);
      const nonce = base64ToBytes(nonceBase64);
      const senderPublicKey = base64ToBytes(senderPublicKeyBase64);

      const decrypted = nacl.box.open(
        encryptedContent,
        nonce,
        senderPublicKey,
        this.keyPair.secretKey
      );

      if (!decrypted) {
        return null; // Decryption failed
      }

      return decodeUTF8(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Broadcast encrypt - encrypt for multiple recipients
  broadcastEncrypt(message, recipientPublicKeysBase64Array) {
    const results = {};
    recipientPublicKeysBase64Array.forEach((pubKeyB64, index) => {
      results[index] = this.encryptMessage(message, pubKeyB64);
    });
    return results;
  }
}

export default EncryptionManager;
