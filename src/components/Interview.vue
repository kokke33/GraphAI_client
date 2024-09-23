<template>
  <div class="interview-container">
    <!-- ヘッダーボタン -->
    <div class="header-buttons">
      <button @click="handleLogout" class="logout-button">ログアウト</button>
      <button @click="openReadme" class="how-to-use-button">使い方</button>
      <button @click="openHistory" class="history-button">履歴</button>
    </div>

    <!-- タブ -->
    <div class="tabs">
      <button :class="['tab', activeTab==='create' ? 'active' : '']" @click="activeTab='create'">質問文作成</button>
      <button :class="['tab', activeTab==='answer' ? 'active' : '']" @click="activeTab='answer'">質問に対するAI回答</button>
    </div>

    <!-- タブコンテンツ -->
    <div class="tab-content">
      <!-- 質問文作成タブ -->
      <div v-show="activeTab==='create'" class="interview">
        <header><h2>質問文作成</h2></header>
        <div class="interview-area">
          <div class="output" ref="outputArea1">
            <div v-for="(conversation, index) in conversations1" :key="index" :class="['conversation-unit', conversation.type]">
              <div v-for="(message, msgIndex) in conversation.messages" :key="msgIndex" :class="['message', conversation.type]">
                <div v-html="renderMessage(message, conversation.type)"></div>
              </div>
            </div>
            <div v-show="isLoading1" class="loading-spinner"><div class="spinner"></div></div>
          </div>
          <div class="input-area">
            <form @submit.prevent="sendMessage(1)" class="message-form">
              <textarea ref="textarea1" v-model="userInput1" placeholder="メッセージを入力..." rows="3"></textarea>
              <button type="submit" class="send-button" aria-label="送信">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-send" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.94 5.94a1 1 0 011.414 0L10 11.086l5.656-5.146a1 1 0 111.414 1.414l-6 5.5a1 1 0 01-1.414 0l-6-5.5a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- AI回答タブ -->
      <div v-show="activeTab==='answer'" class="interview">
        <header><h2>質問に対するAI回答 （30秒ほど待ちます）</h2></header>
        <div class="interview-area">
          <div class="output" ref="outputArea2">
            <div v-for="(conversation, index) in conversations2" :key="index" :class="['conversation-unit', conversation.type]">
              <div v-for="(message, msgIndex) in conversation.messages" :key="msgIndex" :class="['message', conversation.type]">
                <div v-html="renderMessage(message, conversation.type)"></div>
              </div>
            </div>
            <div v-show="isLoading2" class="loading-spinner"><div class="spinner"></div></div>
          </div>
          <div class="input-area">
            <form @submit.prevent="sendMessage(2)" class="message-form">
              <textarea ref="textarea2" v-model="userInput2" placeholder="メッセージを入力..." rows="3"></textarea>
              <button type="submit" class="send-button" aria-label="送信">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-send" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.94 5.94a1 1 0 011.414 0L10 11.086l5.656-5.146a1 1 0 111.414 1.414l-6 5.5a1 1 0 01-1.414 0l-6-5.5a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 履歴モーダル -->
    <div v-if="showHistory" class="modal-overlay" @click.self="closeHistory">
      <div class="modal-content">
        <h2>チャット履歴</h2>
        <button class="close-button" @click="closeHistory">閉じる</button>
        <button class="delete-history-button" @click="deleteHistory">履歴削除</button>

        <!-- 履歴フィルタリングオプション -->
        <div class="history-tabs">
          <button :class="['history-tab', historyFilter === 'all' ? 'active' : '']" @click="historyFilter = 'all'">全て</button>
          <button :class="['history-tab', historyFilter === 'create' ? 'active' : '']" @click="historyFilter = 'create'">質問文作成</button>
          <button :class="['history-tab', historyFilter === 'answer' ? 'active' : '']" @click="historyFilter = 'answer'">AI回答</button>
        </div>

        <!-- 履歴表示 -->
        <div v-if="filteredHistoryData.length === 0">
          <p>履歴がありません。</p>
        </div>
        <div v-else>
          <div v-for="(entry, index) in filteredHistoryData" :key="index" class="history-entry">
            <p><strong>日時:</strong> {{ new Date(entry.timestamp).toLocaleString() }}</p>
            <div :class="['conversation-unit', entry.type]">
              <div :class="['message', entry.type]">
                <div v-html="renderMessage(entry.content, entry.type)"></div>
              </div>
            </div>
            <hr v-if="index < filteredHistoryData.length - 1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 「使い方」モーダル -->
    <div v-if="showHowToUse" class="modal-overlay" @click.self="closeHowToUse">
      <div class="modal-content">
        <h2>使い方</h2>
        <button class="close-button" @click="closeHowToUse">閉じる</button>
        <div class="how-to-use-content">
          <p>このアプリの使い方について説明します。</p>
          <ul>
            <li><strong>質問文作成タブ:</strong> AIに質問を作成してもらうためのタブです。テキストボックスに質問を入力し、送信ボタンをクリックしてください。</li>
            <li><strong>AI回答タブ:</strong> 作成した質問に対するAIの回答を表示します。質問を入力し、送信ボタンをクリックすると、AIからの回答が表示されます。</li>
            <li><strong>履歴ボタン:</strong> 過去のチャット履歴を確認できます。モーダルウィンドウが表示され、以前のメッセージを閲覧できます。</li>
            <li><strong>ログアウトボタン:</strong> アプリからログアウトします。</li>
          </ul>
          <p>その他の機能については、開発者にお問い合わせください。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { marked } from 'marked';
import Convert from 'ansi-to-html';
import { SERVER_URL_1, SERVER_URL_2 } from '../config';

export default {
  data() {
    return {
      activeTab: 'create',
      conversations1: [],
      conversations2: [],
      socket1: null,
      socket2: null,
      userInput1: '',
      userInput2: '',
      ansiConvert: new Convert(),
      isLoading1: false,
      isLoading2: false,
      selectedLanguage: 'ja',
      showHistory: false,
      historyData: [],
      showHowToUse: false,
      historyFilter: 'all', // 履歴フィルタリング用
    };
  },
  computed: {
    /**
     * 履歴データを新しい順にソートして返す
     */
    sortedHistoryData() {
      return this.historyData.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    /**
     * フィルターに基づいて履歴データをフィルタリング
     */
    filteredHistoryData() {
      if (this.historyFilter === 'all') {
        return this.sortedHistoryData;
      }
      return this.sortedHistoryData.filter(entry => entry.tab === this.historyFilter);
    }
  },
  mounted() {
    this.initializeSocket(1);
    this.initializeSocket(2);
    this.loadHistory();
  },
  methods: {
    initializeSocket(id) {
      const url = id === 1 ? SERVER_URL_1 : SERVER_URL_2;
      const socket = io(url);
      this[`socket${id}`] = socket;
      socket.on('connect', () => {
        this.addMessage(id, { type: 'system', content: 'サーバーに接続しました' });
        socket.emit('start_interview');
      });
      socket.on('disconnect', () => {
        this.addMessage(id, { type: 'system', content: 'サーバーから切断されました' });
      });
      socket.on('connect_error', error => {
        console.error(`サーバー${id}への接続エラー:`, error);
      });
      socket.on('interview_result', message => {
        this.addMessage(id, { type: 'system', content: message });
        this[`isLoading${id}`] = false;
        this.$nextTick(() => {
          const textareaRef = `textarea${id}`;
          this.$refs[textareaRef]?.focus();
        });
      });
    },
    /**
     * メッセージを会話に追加し、履歴に保存する
     * @param {number} id - 1または2でconversations1またはconversations2を指定
     * @param {Object} msg - { type: 'user' | 'system', content: 'メッセージ内容' }
     */
    addMessage(id, msg) {
      const conversations = this[`conversations${id}`];
      const lastConversation = conversations[conversations.length - 1];
      if (!lastConversation || lastConversation.type !== msg.type) {
        conversations.push({ type: msg.type, messages: [msg.content] });
      } else {
        lastConversation.messages.push(msg.content);
      }
      this.scrollToBottom(id);

      // 履歴データにメッセージを追加
      this.historyData.push({
        timestamp: new Date(),
        type: msg.type,
        content: msg.content,
        tab: id === 1 ? 'create' : 'answer'
      });

      this.saveHistory();
    },
    scrollToBottom(id) {
      this.$nextTick(() => {
        const outputArea = this.$refs[`outputArea${id}`];
        if (outputArea) outputArea.scrollTop = outputArea.scrollHeight;
      });
    },
    sendMessage(id) {
      const userInput = this[`userInput${id}`].trim();
      if (!userInput) return;
      this.addMessage(id, { type: 'user', content: `You: ${userInput}` });
      this[`socket${id}`].emit('user_input', userInput);
      this[`userInput${id}`] = '';
      this[`isLoading${id}`] = true;
    },
    sanitizeMessage(message) {
      return message.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '').trim();
    },
    renderAnsiToHtml(message) {
      return marked(this.ansiConvert.toHtml(this.sanitizeMessage(message)));
    },
    renderMarkdown(message) {
      return marked(message);
    },
    renderMessage(message, type) {
      return type === 'system' ? this.renderMarkdown(message) : this.renderAnsiToHtml(message);
    },
    handleLogout() {
      // 会話内容を初期化
      this.conversations1 = [];
      this.conversations2 = [];
      this.userInput1 = '';
      this.userInput2 = '';
      this.isLoading1 = false;
      this.isLoading2 = false;
      // 履歴モーダルを閉じる
      this.closeHistory();
      // ルーターでログアウト処理（適宜調整してください）
      this.$router.push('/');
    },
    /**
     * 「使い方」モーダルを開くメソッド
     */
    openReadme() {
      this.openHowToUse();
    },
    /**
     * チャット履歴をロードするメソッド
     * 単一のメッセージリストとして読み込む
     */
    loadHistory() {
      const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
      this.historyData = history;
    },
    /**
     * チャット履歴を保存するメソッド（システムメッセージを除外）
     */
    saveHistory() {
      const EXCLUDED_SYSTEM_MESSAGES = [
        'AI: プロンプトを一緒に作りましょう。何についてのプロンプトでしょうか？',
        'サーバーに接続しました',
        'AI: ■悩んでいること、相談したいことを教えてください',
        'サーバーから切断されました',
        'セッションがタイムアウトしました。接続を終了します。',
        'セッションがタイムアウトしました。接続を終了します。再度ログインしなおしてください。'
      ];

      // システムメッセージのフィルタリング
      const filteredHistory = this.historyData.filter(entry => {
        if (entry.type === 'system') {
          return !EXCLUDED_SYSTEM_MESSAGES.includes(entry.content);
        }
        return true; // 'user' メッセージはそのまま含める
      });

      localStorage.setItem('chatHistory', JSON.stringify(filteredHistory));
    },
    /**
     * 履歴モーダルを開くメソッド
     */
    openHistory() {
      this.loadHistory();
      this.historyFilter = 'all'; // 初期フィルターを「全て」に設定
      this.showHistory = true;
    },
    /**
     * 履歴モーダルを閉じるメソッド
     */
    closeHistory() {
      this.showHistory = false;
    },
    /**
     * 「使い方」モーダルを開くメソッド
     */
    openHowToUse() {
      this.showHowToUse = true;
    },
    /**
     * 「使い方」モーダルを閉じるメソッド
     */
    closeHowToUse() {
      this.showHowToUse = false;
    },
    /**
     * 履歴を削除するメソッド
     */
    deleteHistory() {
      if (confirm('本当に履歴を削除しますか？')) {
        localStorage.removeItem('chatHistory');
        this.historyData = [];
        alert('履歴が削除されました。');
        this.closeHistory();
      }
    }
  },
  beforeDestroy() {
    this.socket1?.close();
    this.socket2?.close();
  },
};
</script>

<style scoped>
.header-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  position: relative;
}
.how-to-use-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.how-to-use-button:hover {
  background-color: #45a049;
}
.logout-button {
  padding: 10px 20px;
  background-color: #ff5c5c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.logout-button:hover {
  background-color: #e04e4e;
}
.history-button {
  padding: 10px 20px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.history-button:hover {
  background-color: #e68900;
}
.interview-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 1200px;
  width: 100%;
  height: 90vh;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
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
  transition: border-bottom .3s, background-color .3s;
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
  box-sizing: border-box;
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
  margin-bottom: 5px;
}
.conversation-unit.system {
  align-items: flex-start;
}
.conversation-unit.user {
  align-items: flex-end;
}
.message {
  padding: 5px 15px;
  border-radius: 20px;
  max-width: 85%;
  word-wrap: break-word;
  position: relative;
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
  justify-content: center;
  align-items: center;
  width: 100%;
}
.message-form textarea {
  width: calc(100% - 70px);
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 25px;
  resize: none;
  outline: none;
  transition: border-color .3s;
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
  font-size: 16px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color .3s;
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
@media (max-width:768px){
  .interview-container{padding:10px}
  .interview-area{height:calc(100vh - 160px)}
  .message{max-width:90%}
  .message.system,.message.user{text-align:left}
  .message-form textarea{font-size:14px}
  .send-button{font-size:14px;padding:8px;width:40px;height:40px}
  .icon-send{width:16px;height:16px}
  .interview header h2{font-size:1.2em}
  .tab{font-size:1em;padding:10px 15px}
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
@keyframes spin {
  to { transform: rotate(360deg); }
}
.language-select {
  margin-top: 10px;
  padding: 5px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  outline: none;
}

/* モーダルのスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 10px;
  padding: 20px;
  position: relative;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
}

.history-entry {
  border-bottom: 1px solid #e5e7eb;
  padding: 10px 0;
}

.history-entry:last-child {
  border-bottom: none;
}

.history-conversations {
  display: flex;
  gap: 20px;
}

.history-conversations > div {
  flex: 1;
}

.history-conversations h4 {
  margin-bottom: 10px;
}

/* 「使い方」モーダル専用のスタイル */
.how-to-use-content {
  margin-top: 20px;
  text-align: left;
}

/* 履歴削除ボタンのスタイル */
.delete-history-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #d9534f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.delete-history-button:hover {
  background-color: #c9302c;
}

/* 履歴モーダル内のタブスタイル */
.history-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin: 20px 0;
}
.history-tab {
  flex: 1;
  padding: 10px 15px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1em;
  cursor: pointer;
  transition: border-bottom .3s, background-color .3s;
}
.history-tab:hover {
  background-color: #f0f4f8;
}
.history-tab.active {
  border-bottom: 2px solid #0066cc;
  font-weight: bold;
  color: #0066cc;
}
</style>
