<template>
  <div class="interview-container">
    <!-- 2つのインタビューセクションを並べて表示 -->
    <div class="interview">
      <h1>質問文作成</h1>
      <div class="interview-area">
        <div class="output" ref="outputArea1">
          <!-- conversations1配列の内容を表示 -->
          <div
            v-for="(conversation, index) in conversations1"
            :key="index"
            class="conversation-unit"
          >
            <!-- 各メッセージを表示 -->
            <div
              v-for="(message, msgIndex) in conversation.messages"
              :key="msgIndex"
              :class="conversation.type"
            >
              <!-- メッセージをHTMLとしてレンダリング -->
              <div v-html="renderMessage(message, conversation.type)"></div>
            </div>
          </div>
        </div>
        <div class="input-area">
          <!-- メッセージ送信用フォーム -->
          <form @submit.prevent="sendMessage(1)">
            <input v-model="userInput1" placeholder="Type your message..." />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
    <div class="interview">
      <h1>質問に対するAI回答</h1>
      <div class="interview-area">
        <div class="output" ref="outputArea2">
          <!-- conversations2配列の内容を表示 -->
          <div
            v-for="(conversation, index) in conversations2"
            :key="index"
            class="conversation-unit"
          >
            <!-- 各メッセージを表示 -->
            <div
              v-for="(message, msgIndex) in conversation.messages"
              :key="msgIndex"
              :class="conversation.type"
            >
              <!-- メッセージをHTMLとしてレンダリング -->
              <div v-html="renderMessage(message, conversation.type)"></div>
            </div>
          </div>
        </div>
        <div class="input-area">
          <!-- メッセージ送信用フォーム -->
          <form @submit.prevent="sendMessage(2)">
            <input v-model="userInput2" placeholder="Type your message..." />
            <button type="submit">Send</button>
          </form>
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
        ? 'https://e155e5bf-4406-40cd-9658-914c7fbd3a0a-00-2wgxc7b0ud0op.pike.replit.dev:3000/'
        : 'https://386417ec-0a11-4913-a099-a1bba467cebf-00-9d23simzanl3.pike.replit.dev:3000/';

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
/* インタビュー全体のコンテナ */
.interview-container {
  display: flex;
  justify-content: space-between;
  max-width: 2400px;
  height: 90vh; /* ウィンドウの高さの90% */
  margin: 0 auto;
  padding: 20px;
}

/* 各インタビューセクション */
.interview {
  width: 48%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
}

h1 {
  text-align: center;
}

/* インタビューエリアのスタイル */
.interview-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-left: 0;
  height: calc(100vh - 100px); /* ウィンドウの高さから100pxを引いた高さ */
}

/* 出力エリアのスタイル */
.output {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 1px solid #eee;
  padding: 10px;
}

/* 入力エリアのスタイル */
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

/* システムメッセージのスタイル */
.system {
  color: #0066cc;
}

/* ユーザーメッセージのスタイル */
.user {
  color: #006600;
  text-align: right;
}

/* 会話ユニットのマージン */
.conversation-unit {
  margin-bottom: 10px;
}
</style>
