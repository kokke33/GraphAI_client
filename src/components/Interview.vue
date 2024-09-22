<template>
  <div class="interview-container">
    <!-- ログアウトボタンと使い方ボタン -->
    <div class="header-buttons">
      <button @click="handleLogout" class="logout-button">ログアウト</button>
      <button @click="openReadme" class="how-to-use-button">使い方</button>
    </div>

    <!-- タブヘッダー -->
    <div class="tabs">
      <button
        :class="['tab', activeTab === 'create' ? 'active' : '']"
        @click="activeTab = 'create'"
      >
        質問文作成
      </button>
      <button
        :class="['tab', activeTab === 'answer' ? 'active' : '']"
        @click="activeTab = 'answer'"
      >
        質問に対するAI回答
      </button>
    </div>

    <!-- タブコンテンツ -->
    <div class="tab-content">
      <!-- 質問文作成タブ -->
      <div v-show="activeTab === 'create'" class="interview">
        <header>
          <h2>質問文作成</h2>
        </header>
        <div class="interview-area">
          <div class="output" ref="outputArea1">
            <!-- conversations1配列の内容を表示 -->
            <div
              v-for="(conversation, index) in conversations1"
              :key="index"
              :class="['conversation-unit', conversation.type]"
            >
              <!-- 各メッセージを表示 -->
              <div
                v-for="(message, msgIndex) in conversation.messages"
                :key="msgIndex"
                :class="['message', conversation.type]"
              >
                <!-- メッセージをHTMLとしてレンダリング -->
                <div v-html="renderMessage(message, conversation.type)"></div>
              </div>
            </div>
            <!-- ローディングアニメーションの追加 -->
            <div v-show="isLoading1" class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
          <div class="input-area">
            <!-- メッセージ送信用フォーム -->
            <form @submit.prevent="sendMessage(1)" class="message-form">
              <textarea
                ref="textarea1"
                v-model="userInput1"
                placeholder="メッセージを入力..."
                rows="3"
              ></textarea>
              <button type="submit" class="send-button" aria-label="送信">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon-send"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.94 5.94a1 1 0 011.414 0L10 11.086l5.656-5.146a1 1 0 111.414 1.414l-6 5.5a1 1 0 01-1.414 0l-6-5.5a1 1 0 010-1.414z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- 質問に対するAI回答タブ -->
      <div v-show="activeTab === 'answer'" class="interview">
        <header>
          <h2>質問に対するAI回答 （30秒ほど待ちます）</h2>
        </header>
        <div class="interview-area">
          <div class="output" ref="outputArea2">
            <!-- conversations2配列の内容を表示 -->
            <div
              v-for="(conversation, index) in conversations2"
              :key="index"
              :class="['conversation-unit', conversation.type]"
            >
              <!-- 各メッセージを表示 -->
              <div
                v-for="(message, msgIndex) in conversation.messages"
                :key="msgIndex"
                :class="['message', conversation.type]"
              >
                <!-- メッセージをHTMLとしてレンダリング -->
                <div v-html="renderMessage(message, conversation.type)"></div>
              </div>
            </div>
            <!-- ローディングアニメーションの追加 -->
            <div v-show="isLoading2" class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
          <div class="input-area">
            <!-- メッセージ送信用フォーム -->
            <form @submit.prevent="sendMessage(2)" class="message-form">
              <textarea
                ref="textarea2"
                v-model="userInput2"
                placeholder="メッセージを入力..."
                rows="3"
              ></textarea>
              <button type="submit" class="send-button" aria-label="送信">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon-send"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
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
// 必要なライブラリをインポート
import io from 'socket.io-client';
import { marked } from 'marked';
import Convert from 'ansi-to-html';

export default {
  data() {
    return {
      activeTab: 'create', // 'create' または 'answer'
      conversations1: [],
      conversations2: [],
      socket1: null,
      socket2: null,
      userInput1: '',
      userInput2: '',
      ansiConvert: new Convert(),
      isLoading1: false,
      isLoading2: false,
      selectedLanguage: 'ja'  // 追加: 言語選択のデフォルト値
    };
  },
  mounted() {
    this.initializeSocket(1);
    this.initializeSocket(2);
  },
  methods: {
    initializeSocket(id) {
      const url = id === 1
        ? 'https://server-kokke33.replit.app/'
        : 'https://server-2-kokke33.replit.app/';
      const socket = io(url);
      this[`socket${id}`] = socket;

      socket.on('connect', () => {
        this.addMessage(id, {
          type: 'system',
          content: 'サーバーに接続しました',
        });
        socket.emit('start_interview');
      });

      socket.on('disconnect', () => {
        this.addMessage(id, {
          type: 'system',
          content: 'サーバーから切断されました',
        });
      });

      socket.on('connect_error', (error) => {
        console.error(`サーバー${id}への接続エラー:`, error);
      });

      socket.on('interview_result', (message) => {
        this.addMessage(id, { type: 'system', content: message });
        
        // ローディングを終了
        if (id === 1) {
          this.isLoading1 = false;
        } else if (id === 2) {
          this.isLoading2 = false;
        }

        this.$nextTick(() => {
          const textareaRef = `textarea${id}`;
          if (this.$refs[textareaRef]) {
            this.$refs[textareaRef].focus();
          }
        });
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
      this[`socket${id}`].emit('user_input', userInput.trim());
      this[`userInput${id}`] = '';
      
      // ローディングを開始
      if (id === 1) {
        this.isLoading1 = true;
      } else if (id === 2) {
        this.isLoading2 = true;
      }
    },
    sanitizeMessage(message) {
      const regex = /\x1B\[[0-?]*[ -/]*[@-~]/g;
      return message.replace(regex, '').trim();
    },
    renderAnsiToHtml(message) {
      const sanitizedMessage = this.sanitizeMessage(message);
      const htmlMessage = this.ansiConvert.toHtml(sanitizedMessage);
      return marked(htmlMessage);
    },
    renderMarkdown(message) {
      return marked(message);
    },
    renderMessage(message, type) {
      if (type === 'system') {
        return this.renderMarkdown(message);
      }
      return this.renderAnsiToHtml(message);
    },
    // ログアウト処理
    handleLogout() {
      this.$router.push('/');
    },
    // 使い方ページへ遷移
    openReadme() {
      window.open('https://github.com/kokke33/GraphAI/blob/main/README2.md', '_blank');
    }
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
/* ヘッダーボタンコンテナのスタイル */
.header-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  position: relative; /* ログアウトボタンの位置を維持 */
}

/* 使い方ボタンのスタイル */
.how-to-use-button {
  padding: 10px 20px;
  background-color: #4CAF50; /* 緑色 */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.how-to-use-button:hover {
  background-color: #45a049;
}

/* ログアウトボタンのスタイル（既存） */
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

/* 全体コンテナのスタイリング */
.interview-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 1200px;
  width: 100%;
  height: 90vh;   /* 高さ */
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

/* 深い p タグにマージンを適用 */
:deep(p) {
  margin-top: 2px;
  margin-bottom: 2px;
}

/* タブヘッダーのスタイリング */
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

/* タブコンテンツのスタイリング */
.tab-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 各インタビューセクションのスタイリング */
.interview {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ヘッダーのスタイリング */
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

/* インタビューエリアのスタイリング */
.interview-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 10px;
  height: calc(90vh - 135px);
  box-sizing: border-box;
}

/* メッセージ出力エリアのスタイリング */
.output {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* 各メッセージユニットのスタイリング */
.conversation-unit {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.conversation-unit.system {
  align-items: flex-start;
}

.conversation-unit.user {
  align-items: flex-end;
}

/* メッセージのスタイリング */
.message {
  padding: 10px 15px;
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

/* 入力エリアのスタイリング */
.input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px; /* ボタンとの隙間 */
}

.message-form {
  display: flex;
  justify-content: center; /* フォーム内のアイテムを中央に配置 */
  align-items: center;
  width: 100%;
}

.message-form textarea {
  width: calc(100% - 70px); /* 幅を調整 */
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 25px;
  resize: none;
  outline: none;
  transition: border-color 0.3s;
  margin-right: 10px; /* テキストエリアとボタンの間にマージンを追加 */
}

.message-form textarea:focus {
  border-color: #0066cc;
  box-shadow: 0 0 5px rgba(0, 102, 204, 0.5);
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
  .interview-container {
    padding: 10px;
  }

  .interview-area {
    height: calc(100vh - 160px);
  }

  .message {
    max-width: 90%;
  }

  .message.system {
    text-align: left;
  }

  .message.user {
    text-align: right;
  }

  .message-form textarea {
    font-size: 14px;
  }

  .send-button {
    font-size: 14px;
    padding: 8px;
    width: 40px;
    height: 40px;
  }

  .icon-send {
    width: 16px;
    height: 16px;
  }

  .interview header h2 {
    font-size: 1.2em;
  }

  .tab {
    font-size: 1em;
    padding: 10px 15px;
  }
}

/* ローディングスピナーのスタイル */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #0066cc;
  animation: spin 1s linear infinite;
}

/* スピナーのアニメーション */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 言語選択プルダウンのスタイル */
.language-select {
  margin-top: 10px; /* 送信ボタンとプルダウンの間に余白を追加 */
  padding: 5px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  outline: none;
}
</style>
