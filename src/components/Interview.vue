<template>
  <div class="interview-container">
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
      <div v-if="activeTab === 'create'" class="interview">
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
      <div v-if="activeTab === 'answer'" class="interview">
        <header>
          <h2>質問に対するAI回答</h2>
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
      // タブの状態を管理
      activeTab: 'create', // 'create' または 'answer'

      // 会話内容を保持する配列
      conversations1: [],
      conversations2: [],

      // ソケット接続用の変数
      socket1: null,
      socket2: null,

      // ユーザーの入力内容
      userInput1: '',
      userInput2: '',

      // ANSIコードをHTMLに変換するためのインスタンス
      ansiConvert: new Convert(),
    };
  },
  mounted() {
    // コンポーネントがマウントされたときにソケットを初期化
    this.initializeSocket(1);
    this.initializeSocket(2);
  },
  methods: {
    // ソケットを初期化するメソッド
    initializeSocket(id) {
      // 接続先URLを決定
      const url =
        id === 1
          // 本番環境のURLに置き換えてください
          ? 'https://1b120746-d01d-4c50-a1df-b14a935e62db-00-3sheu5l7kp029.sisko.replit.dev:3000/'
          : 'https://ed9c723d-e4a9-4a46-8339-8c67361a2328-00-34esi9rijxbcr.sisko.replit.dev:3000/';

      // ソケット接続を確立
      const socket = io(url);
      this[`socket${id}`] = socket;

      // 接続成功時の処理
      socket.on('connect', () => {
        this.addMessage(id, {
          type: 'system',
          content: 'サーバーに接続しました',
        });
        console.log(`サーバー${id}に接続しました`);
        socket.emit('start_interview');
        console.log(`サーバー${id}にstart_interviewイベントを送信しました`);
      });

      // 切断時の処理
      socket.on('disconnect', () => {
        this.addMessage(id, {
          type: 'system',
          content: 'サーバーから切断されました',
        });
        console.log(`サーバー${id}から切断されました`);
      });

      // 接続エラー時の処理
      socket.on('connect_error', (error) => {
        console.error(`サーバー${id}への接続エラー:`, error);
      });

      // サーバーからのメッセージ受信時の処理
      socket.on('interview_result', (message) => {
        this.addMessage(id, { type: 'system', content: message });
        console.log(`サーバー${id}からのメッセージ:`, message);

        // 応答を受け取った後にテキストエリアにフォーカスを設定
        this.$nextTick(() => {
          const textareaRef = `textarea${id}`;
          if (this.$refs[textareaRef]) {
            this.$refs[textareaRef].focus();
          }
        });
      });
    },
    // メッセージを会話に追加するメソッド
    addMessage(id, msg) {
      const conversations = this[`conversations${id}`];
      const lastConversation = conversations[conversations.length - 1];
      // 新しいタイプのメッセージの場合、新しい会話ユニットを作成
      if (!lastConversation || lastConversation.type !== msg.type) {
        conversations.push({ type: msg.type, messages: [msg.content] });
      } else {
        // 同じタイプのメッセージの場合、既存のユニットに追加
        lastConversation.messages.push(msg.content);
      }
      // 最新のメッセージまでスクロール
      this.scrollToBottom(id);
    },
    // 出力エリアをスクロールするメソッド
    scrollToBottom(id) {
      this.$nextTick(() => {
        const outputArea = this.$refs[`outputArea${id}`];
        if (outputArea) {
          outputArea.scrollTop = outputArea.scrollHeight;
        }
      });
    },
    // メッセージを送信するメソッド
    sendMessage(id) {
      const userInput = this[`userInput${id}`];
      if (userInput.trim() === '') return;
      // ユーザーのメッセージを会話に追加
      this.addMessage(id, { type: 'user', content: `You: ${userInput}` });
      console.log(`サーバー${id}にメッセージを送信:`, userInput);
      // サーバーにユーザー入力を送信
      this[`socket${id}`].emit('user_input', userInput.trim());
      console.log(`メッセージが送信されました: ${userInput}`);
      // 入力フィールドをクリア
      this[`userInput${id}`] = '';
    },
    // メッセージからANSIエスケープコードを除去するメソッド
    sanitizeMessage(message) {
      const regex = /\x1B\[[0-?]*[ -/]*[@-~]/g; // ANSIエスケープコードの正規表現
      return message.replace(regex, '').trim();
    },
    // ANSIコードをHTMLに変換するメソッド
    renderAnsiToHtml(message) {
      const sanitizedMessage = this.sanitizeMessage(message);
      const htmlMessage = this.ansiConvert.toHtml(sanitizedMessage);
      return marked(htmlMessage);
    },
    // マークダウンをHTMLに変換するメソッド
    renderMarkdown(message) {
      return marked(message);
    },
    // メッセージを適切な形式でレンダリングするメソッド
    renderMessage(message, type) {
      if (type === 'system') {
        return this.renderMarkdown(message);
      }
      return this.renderAnsiToHtml(message);
    },
  },
  beforeDestroy() {
    // コンポーネントが破棄される前にソケットを閉じる
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
/* 全体コンテナのスタイリング */
.interview-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 1200px;
  width: 100%;
  height: 100vh; /* ウィンドウの高さ */
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

/* <p>タグにマージンを適用 */
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
  height: calc(100vh - 120px); /* ヘッダーとタブの高さを減算 */
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
  max-width: 85%; /* 75% から 85% に増加 */
  word-wrap: break-word;
  position: relative;
  margin-bottom: 5px;
}

/* サーバーメッセージ（左寄り） */
.message.system {
  background-color: #e0f7fa;
  color: #0066cc;
  text-align: left;
}

/* ユーザーメッセージ（右寄り） */
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
}

/* メッセージフォームのスタイリング */
.message-form {
  display: flex;
  width: 100%;
}

/* テキストエリアのスタイリング */
.message-form textarea {
  flex-grow: 1;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 25px;
  resize: none; /* ユーザーが手動でサイズを変更できないようにする */
  outline: none;
  transition: border-color 0.3s;
}

.message-form textarea:focus {
  border-color: #0066cc;
  box-shadow: 0 0 5px rgba(0, 102, 204, 0.5); /* フォーカス時の視覚効果 */
}

/* 送信ボタンのスタイリング */
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
  width: 50px; /* ボタンの幅を固定 */
  height: 50px; /* ボタンの高さを固定 */
}

.send-button:hover {
  background-color: #005bb5;
}

/* 送信アイコンのスタイリング */
.icon-send {
  width: 20px;
  height: 20px;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .interview-container {
    padding: 10px;
  }

  .interview-area {
    height: calc(100vh - 160px); /* タブとヘッダーの高さを調整 */
  }

  .message {
    max-width: 90%; /* モバイル画面ではさらに幅を広げる */
  }

  /* メッセージのテキスト揃えを維持 */
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
    width: 40px; /* ボタンの幅をさらに縮小 */
    height: 40px; /* ボタンの高さをさらに縮小 */
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
</style>
