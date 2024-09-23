<template>
  <div class="interview-container">
    <!-- ヘッダーボタン -->
    <div class="header-buttons">
      <button @click="handleLogout" class="logout-button">ログアウト</button>
      <button @click="openReadme" class="how-to-use-button">使い方</button>
    </div>

    <!-- タブヘッダー -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', activeTab === tab.key ? 'active' : '']"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- タブコンテンツ -->
    <div class="tab-content">
      <div v-for="tab in tabs" :key="tab.key" v-show="activeTab === tab.key" class="interview">
        <header>
          <h2>{{ tab.header }}</h2>
        </header>
        <div class="interview-area">
          <div class="output" :ref="'outputArea' + tab.id">
            <div
              v-for="(conversation, index) in conversations[tab.key]"
              :key="index"
              :class="['conversation-unit', conversation.type]"
            >
              <div
                v-for="(message, msgIndex) in conversation.messages"
                :key="msgIndex"
                :class="['message', conversation.type]"
              >
                <div v-html="renderMessage(message, conversation.type)"></div>
              </div>
            </div>
            <div v-show="isLoading[tab.key]" class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
          <div class="input-area">
            <form @submit.prevent="sendMessage(tab.id)" class="message-form">
              <textarea
                :ref="'textarea' + tab.id"
                v-model="userInput[tab.key]"
                placeholder="メッセージを入力..."
                rows="3"
              ></textarea>
              <button type="submit" class="send-button" aria-label="送信">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-send" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.94 5.94a1 1 0 011.414 0L10 11.086l5.656-5.146a1 1 0 111.414 1.414l-6 5.5a1 1 0 01-1.414 0l-6-5.5a1 1 0 010-1.414z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { io } from 'socket.io-client';
import { marked } from 'marked';
import Convert from 'ansi-to-html';
import { SERVER_URL_1, SERVER_URL_2 } from '../config';

export default {
  data() {
    return {
      tabs: [
        { key: 'create', label: '質問文作成', header: '質問文作成', id: 1, serverUrl: SERVER_URL_1 },
        { key: 'answer', label: '質問に対するAI回答', header: '質問に対するAI回答 （30秒ほど待ちます）', id: 2, serverUrl: SERVER_URL_2 },
      ],
      activeTab: 'create',
      conversations: { create: [], answer: [] },
      sockets: { create: null, answer: null },
      userInput: { create: '', answer: '' },
      ansiConvert: new Convert(),
      isLoading: { create: false, answer: false },
      selectedLanguage: 'ja',
    };
  },
  mounted() {
    this.tabs.forEach(tab => this.initializeSocket(tab.key, tab.serverUrl));
  },
  methods: {
    initializeSocket(key, url) {
      const socket = io(url);
      this.sockets[key] = socket;

      socket.on('connect', () => {
        this.addMessage(key, { type: 'system', content: 'サーバーに接続しました' });
        socket.emit('start_interview');
      });

      socket.on('disconnect', () => {
        this.addMessage(key, { type: 'system', content: 'サーバーから切断されました' });
      });

      socket.on('connect_error', error => {
        console.error(`サーバー${key}への接続エラー:`, error);
      });

      socket.on('interview_result', message => {
        this.addMessage(key, { type: 'system', content: message });
        this.isLoading[key] = false;
        this.$nextTick(() => {
          const textarea = this.$refs[`textarea${this.tabs.find(t => t.key === key).id}`];
          if (textarea) textarea.focus();
        });
      });
    },
    addMessage(key, msg) {
      const conv = this.conversations[key];
      const last = conv[conv.length - 1];
      if (!last || last.type !== msg.type) {
        conv.push({ type: msg.type, messages: [msg.content] });
      } else {
        last.messages.push(msg.content);
      }
      this.scrollToBottom(key);
    },
    scrollToBottom(key) {
      this.$nextTick(() => {
        const output = this.$refs[`outputArea${this.tabs.find(t => t.key === key).id}`];
        if (output) output.scrollTop = output.scrollHeight;
      });
    },
    sendMessage(id) {
      const tab = this.tabs.find(t => t.id === id);
      if (!tab) return;
      const key = tab.key;
      const input = this.userInput[key].trim();
      if (!input) return;
      this.addMessage(key, { type: 'user', content: `You: ${input}` });
      this.sockets[key].emit('user_input', input);
      this.userInput[key] = '';
      this.isLoading[key] = true;
    },
    sanitizeMessage(msg) {
      return msg.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '').trim();
    },
    renderAnsiToHtml(msg) {
      return marked(this.ansiConvert.toHtml(this.sanitizeMessage(msg)));
    },
    renderMarkdown(msg) {
      return marked(msg);
    },
    renderMessage(msg, type) {
      return type === 'system' ? this.renderMarkdown(msg) : this.renderAnsiToHtml(msg);
    },
    handleLogout() {
      this.$router.push('/');
    },
    openReadme() {
      window.open('https://github.com/kokke33/GraphAI/blob/main/README2.md', '_blank');
    },
  },
  beforeUnmount() { // Vue 3 の場合
    Object.values(this.sockets).forEach(socket => {
      if (socket) socket.close();
    });
  },
};
</script>
<style scoped>
.header-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.how-to-use-button,
.logout-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.how-to-use-button {
  background-color: #4CAF50;
  color: white;
}
.how-to-use-button:hover {
  background-color: #45a049;
}
.logout-button {
  background-color: #ff5c5c;
  color: white;
}
.logout-button:hover {
  background-color: #e04e4e;
}
.interview-container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  height: 90vh;
  margin: 0 auto;
  padding: 10px;
  background-color: #f5f7fa;
}
:deep(p) {
  margin: 2px 0;
}
.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}
.tab {
  flex: 1;
  padding: 15px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1.2em;
  cursor: pointer;
  transition: border-bottom 0.3s, background-color 0.3s;
}
.tab:hover {
  background-color: #f0f4f8;
}
.tab.active {
  border-bottom: 2px solid #0066cc;
  font-weight: bold;
  color: #0066cc;
}
.tab-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.interview {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}
.interview header {
  background-color: #0066cc;
  padding: 15px 20px;
  color: white;
  text-align: center;
}
.interview header h2 {
  margin: 0;
  font-size: 1.5em;
}
.interview-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 10px;
  height: calc(90vh - 135px);
}
.output {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.conversation-unit {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
.conversation-unit.system { align-items: flex-start; }
.conversation-unit.user { align-items: flex-end; }
.message {
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 85%;
  word-wrap: break-word;
  margin-bottom: 5px;
}
.message.system {
  background-color: #e0f7fa;
  color: #0066cc;
  text-align: left;
}
.message.user {
  background-color: #dcf8c6;
  color: #006600;
  text-align: right;
}
.input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.message-form {
  display: flex;
  align-items: center;
  width: 100%;
}
.message-form textarea {
  flex: 1;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 25px;
  resize: none;
  outline: none;
  transition: border-color 0.3s;
  margin-right: 10px;
}
.message-form textarea:focus {
  border-color: #0066cc;
  box-shadow: 0 0 5px rgba(0,102,204,0.5);
}
.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 50px;
  height: 50px;
}
.send-button:hover {
  background-color: #005bb5;
}
.icon-send {
  width: 20px;
  height: 20px;
}
@media (max-width: 768px) {
  .interview-container { padding: 10px; }
  .interview-area { height: calc(100vh - 160px); }
  .message { max-width: 90%; }
  .message-form textarea { font-size: 14px; }
  .send-button { font-size: 14px; padding: 8px; width: 40px; height: 40px; }
  .icon-send { width: 16px; height: 16px; }
  .interview header h2 { font-size: 1.2em; }
  .tab { font-size: 1em; padding: 10px 15px; }
}
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
.spinner {
  border: 4px solid rgba(0,0,0,0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #0066cc;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.language-select {
  margin-top: 10px;
  padding: 5px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  outline: none;
}
</style>
