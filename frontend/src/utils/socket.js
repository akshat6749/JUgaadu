// utils/socket.js

let socket = null;
let messageListener = null;

// Use environment variables for WebSocket URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/chat/";

export function initializeSocket(authToken) {
  if (socket || !authToken) {
    console.log("Socket already initialized or no auth token provided.");
    return;
  }

  // Append token to WebSocket URL for authentication
  const url = `${WS_URL}?token=${authToken}`;
  
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("✅ WebSocket connection established.");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (messageListener) {
        messageListener(data);
      }
    } catch (error) {
      console.error("Error parsing incoming socket message:", error);
    }
  };

  socket.onclose = (event) => {
    console.warn("WebSocket connection closed:", event.reason);
    socket = null; // Clear the instance for re-initialization
  };

  socket.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
  };
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
    console.log("WebSocket connection disconnected.");
  }
}

/**
 * Sends a structured message through the WebSocket.
 * @param {object} payload - The data to send.
 */
function send(payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    console.error("Cannot send message, WebSocket is not open.");
  }
}

// --- Event Emitters ---

export function joinConversation(conversationId) {
  send({ type: 'join_conversation', conversation_id: conversationId });
}

export function leaveConversation() {
  send({ type: 'leave_conversation' });
}

export function sendSocketMessage(conversationId, content) {
  send({ type: 'send_message', conversation_id: conversationId, content: content });
}

export function sendTyping(conversationId, isTyping) {
  send({ type: 'typing', conversation_id: conversationId, is_typing: isTyping });
}

export function markMessageAsRead(messageId) {
  send({ type: 'mark_read', message_id: messageId });
}

// --- Event Listeners ---

export function onMessage(callback) {
  messageListener = callback;
}

export function offMessage() {
  messageListener = null;
}