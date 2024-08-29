<template>
  <div class="interview">
    <h1>Interactive Interview</h1>
    <div class="interview-area">
      <div class="output">
        <p v-for="(message, index) in messages" :key="index" :class="messageClass(message)">
          {{ message.content }}
        </p>
      </div>
      <div class="input-area">
        <input v-model="userInput" @keydown.enter="sendMessage" placeholder="Type your message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      messages: [],
      socket: null,
      userInput: '',
    };
  },
  mounted() {
    // Initialize socket connection
    this.socket = io('https://11464503-3bd7-4c93-8529-ab8a75dbf46d-00-pwprcld8qntr.sisko.replit.dev:3003');

    // Handle connection event
    this.socket.on('connect', () => {
      this.addMessage({ type: 'system', content: 'Connected to server' });
      console.log('Connected to server');
      
      // Send start_interview event
      this.socket.emit('start_interview');
      console.log('Sent start_interview event to server');
    });

    // Handle disconnection event
    this.socket.on('disconnect', () => {
      this.addMessage({ type: 'system', content: 'Disconnected from server' });
      console.log('Disconnected from server');
    });

    // Handle messages received from the server
    this.socket.on('interview_result', (message) => {
      this.addMessage({ type: 'system', content: `Message from server: ${message}` });
      console.log('Message from server:', message);
    });
  },
  methods: {
    addMessage(msg) {
      this.messages.push(msg);
    },
    messageClass(message) {
      return message.type;
    },
    sendMessage() {
      if (this.userInput.trim() === '') return;
      this.addMessage({ type: 'user', content: `You: ${this.userInput}` });
      console.log('Sending message:', this.userInput);
      this.socket.emit('user_input', this.userInput.trim());
      this.userInput = '';
    },
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>

<style scoped>
.interview {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
}

.interview-area {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
}

.output {
  height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 1px solid #eee;
  padding: 10px;
}

.output p {
  margin: 5px 0;
}

.input-area {
  display: flex;
}

input {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
}

button {
  padding: 10px;
  font-size: 16px;
}

.system {
  color: #0066cc;
}

.user {
  color: #006600;
  text-align: right;
}
</style>