<template>
  <div class="interview-container">
    <div class="interview">
      <h1>Interactive Interview 1</h1>
      <div class="interview-area">
        <div class="output" ref="outputArea1">
          <div v-for="(conversation, index) in conversations1" :key="index" class="conversation-unit">
            <div v-for="(message, msgIndex) in conversation.messages" :key="msgIndex" :class="conversation.type">
              <div v-html="renderAnsiToHtml(message)"></div>
            </div>
          </div>
        </div>
        <div class="input-area">
          <input v-model="userInput1" @keydown.enter="sendMessage(1)" placeholder="Type your message..." />
          <button @click="sendMessage(1)">Send</button>
        </div>
      </div>
    </div>
    <div class="interview">
      <h1>Interactive Interview 2</h1>
      <div class="interview-area">
        <div class="output" ref="outputArea2">
          <div v-for="(conversation, index) in conversations2" :key="index" class="conversation-unit">
            <div v-for="(message, msgIndex) in conversation.messages" :key="msgIndex" :class="conversation.type">
              <div v-html="renderAnsiToHtml(message)"></div>
            </div>
          </div>
        </div>
        <div class="input-area">
          <input v-model="userInput2" @keydown.enter="sendMessage(2)" placeholder="Type your message..." />
          <button @click="sendMessage(2)">Send</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { marked } from 'marked';
import Convert from 'ansi-to-html';

export default {
  data() {
    return {
      conversations1: [],
      conversations2: [],
      socket1: null,
      socket2: null,
      userInput1: '',
      userInput2: '',
      ansiConvert: new Convert(),
    };
  },
  mounted() {
    this.initializeSocket(1);
    this.initializeSocket(2);
  },
  methods: {
    initializeSocket(id) {
      const url = id === 1 
        ? 'https://e155e5bf-4406-40cd-9658-914c7fbd3a0a-00-2wgxc7b0ud0op.pike.replit.dev:3000/'
        : 'https://e155e5bf-4406-40cd-9658-914c7fbd3a0a-00-2wgxc7b0ud0op.pike.replit.dev:3001/';
      
      const socket = io(url);
      this[`socket${id}`] = socket;

      socket.on('connect', () => {
        this.addMessage(id, { type: 'system', content: 'Connected to server' });
        console.log(`Connected to server ${id}`);
        socket.emit('start_interview');
        console.log(`Sent start_interview event to server ${id}`);
      });

      socket.on('disconnect', () => {
        this.addMessage(id, { type: 'system', content: 'Disconnected from server' });
        console.log(`Disconnected from server ${id}`);
      });

      socket.on('connect_error', (error) => {
        console.error(`Connection error to server ${id}:`, error);
      });

      socket.on('interview_result', (message) => {
        this.addMessage(id, { type: 'system', content: `　 ${message}` });
        console.log(`Message from server ${id}:`, message);
      });
    },
    addMessage(id, msg) {
      const conversations = this[`conversations${id}`];
      const lastConversation = conversations[conversations.length - 1];
      if (!lastConversation || lastConversation.type !== msg.type) {
        conversations.push({ type: msg.type, messages: [msg.content] });
      } else {
        lastConversation.messages.push(msg.content);
      }
      this.scrollToBottom(id);
    },
    scrollToBottom(id) {
      this.$nextTick(() => {
        const outputArea = this.$refs[`outputArea${id}`];
        if (outputArea) {
          outputArea.scrollTop = outputArea.scrollHeight;
        }
      });
    },
    sendMessage(id) {
      const userInput = this[`userInput${id}`];
      if (userInput.trim() === '') return;
      this.addMessage(id, { type: 'user', content: `You: ${userInput}` });
      console.log(`Sending message to server ${id}:`, userInput);
      this[`socket${id}`].emit('user_input', userInput.trim());
      this[`userInput${id}`] = '';
    },
    sanitizeMessage_pre(message) {
      const regex = /\x1B\[\??[0-9]*(h|m)\??|\x1B\[[0-9].*あなた.*$/g;
      return message.replace(regex, '').trim();
    },
    sanitizeMessage(message) {
      const regex = /あなた:/g;
      return message.replace(regex, '').trim();
    },
    renderAnsiToHtml(message) {
      const sanitizedMessage = this.sanitizeMessage(this.sanitizeMessage_pre(message));
      const htmlMessage = this.ansiConvert.toHtml(sanitizedMessage);
      return marked(htmlMessage);
    },
  },
  beforeDestroy() {
    if (this.socket1) {
      this.socket1.close();
    }
    if (this.socket2) {
      this.socket2.close();
    }
  },
};
</script>

<style scoped>
.interview-container {
  display: flex;
  justify-content: space-between;
  max-width: 2400px;
  margin: 0 auto;
  padding: 20px;
}

.interview {
  width: 48%;
  max-width: 1200px;
}

h1 {
  text-align: center;
}

.interview-area {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-left: 0;
}

.output {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 1px solid #eee;
  padding: 10px;
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

.conversation-unit {
  margin-bottom: 10px;
}
</style>