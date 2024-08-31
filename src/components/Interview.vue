  <template>
    <div class="interview">
      <h1>Interactive Interview</h1>
      <div class="interview-area">
        <div class="output" ref="outputArea">
          <div v-for="(conversation, index) in conversations" :key="index" class="conversation-unit">
            <div v-for="(message, msgIndex) in conversation.messages" :key="msgIndex" :class="conversation.type">
              <div v-html="renderMarkdown(sanitizeMessage(sanitizeMessage_pre(message)))"></div>
            </div>
          </div>
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
  import { marked } from 'marked';

  export default {
    data() {
      return {
        conversations: [],
        socket: null,
        userInput: '',
      };
    },
    mounted() {
      this.socket = io('https://e155e5bf-4406-40cd-9658-914c7fbd3a0a-00-2wgxc7b0ud0op.pike.replit.dev:3000/');

      this.socket.on('connect', () => {
        this.addMessage({ type: 'system', content: 'Connected to server' });
        console.log('Connected to server');
        this.socket.emit('start_interview');
        console.log('Sent start_interview event to server');
      });

      this.socket.on('disconnect', () => {
        this.addMessage({ type: 'system', content: 'Disconnected from server' });
        console.log('Disconnected from server');
      });

      this.socket.on('interview_result', (message) => {
        this.addMessage({ type: 'system', content: `　 ${message}` });
        console.log('Message from server:', message);
      });
    },
    methods: {
      addMessage(msg) {
        if (this.conversations.length === 0 || this.conversations[this.conversations.length - 1].type !== msg.type) {
          this.conversations.push({ type: msg.type, messages: [msg.content] });
        } else {
          this.conversations[this.conversations.length - 1].messages.push(msg.content);
        }

        this.$nextTick(() => {
          const outputArea = this.$refs.outputArea;
          if (outputArea) {
            outputArea.scrollTop = outputArea.scrollHeight;
          }
        });
      },
      sendMessage() {
        if (this.userInput.trim() === '') return;
        this.addMessage({ type: 'user', content: `You: ${this.userInput}` });
        console.log('Sending message:', this.userInput);
        this.socket.emit('user_input', this.userInput.trim());
        this.userInput = '';
      },
      sanitizeMessage_pre(message) {
        const regex = /\x1B\[\??[0-9]*(h|m)\??|\x1B\[[0-9].*あなた.*$/g;
        return message.replace(regex, '').trim();
      },
      sanitizeMessage(message) {
        const regex = /あなた:/g;
        return message.replace(regex, '').trim();
      },
      renderMarkdown(message) {
        return marked(message);
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
    max-width: 1200px;
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

  .conversation-unit >>> pre {
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 3px;
    padding: 10px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .conversation-unit >>> code {
    background-color: #f4f4f4;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .conversation-unit >>> p {
    margin-bottom: 10px;
  }

  .conversation-unit >>> ul, .conversation-unit >>> ol {
    padding-left: 20px;
  }

  .conversation-unit >>> table {
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .conversation-unit >>> th, .conversation-unit >>> td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  .conversation-unit >>> th {
    background-color: #f4f4f4;
  }
  </style>