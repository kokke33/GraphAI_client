<!-- Interview.vue -->
<template>
  <div class="interview-container">
    <!-- ヘッダーコンテナ -->
    <div class="header">
      <div class="user-id">ユーザー: {{ loginID }}</div>
      <div class="header-buttons">
        <!--<button @click="handleLogout" class="logout-button">ログアウト</button>-->
        <button @click="openReadme" class="how-to-use-button">使い方</button>
        <button @click="openHistory" class="history-button">履歴</button>
      </div>
    </div>

    <!-- タブ -->
    <div class="tabs">
      <button :class="['tab', activeTab === 'create' ? 'active' : '']" @click="activeTab = 'create'">質問文作成</button>
      <button :class="['tab', activeTab === 'answer' ? 'active' : '']" @click="activeTab = 'answer'">質問に対するAI回答</button>
      <button :class="['tab', activeTab === 'chatgpt' ? 'active' : '']" @click="activeTab = 'chatgpt'">ChatGPT</button>
    </div>

    <!-- タブコンテンツ -->
    <div class="tab-content">
      <!-- 質問文作成タブ -->
      <div v-show="activeTab === 'create'" class="interview">
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
      <div v-show="activeTab === 'answer'" class="interview">
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

      <!-- ChatGPTタブ -->
      <div v-show="activeTab === 'chatgpt'" class="interview">
        <header><h2>ChatGPT</h2></header>
        <div class="interview-area chatgpt-area">
          <button @click="openChatGPT" class="open-chatgpt-button">ChatGPTを開く</button>
          <p class="chatgpt-note">
            ChatGPTへの質問回数の上限は、無料版では1分あたり最大60回です。<br>
            ログインなどは不要ですぐに利用できます。無料範囲内でどんどん利用してみてください。
          </p>
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
          <button :class="['history-tab', historyFilter === 'chatgpt' ? 'active' : '']" @click="historyFilter = 'chatgpt'">ChatGPT</button>
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
            <li><strong>質問文作成タブ:</strong><br> AIに質問を作成してもらうためのタブです。テキストボックスに質問を入力し、送信ボタンをクリックしてください。大雑把な質問から開始して、AIとの会話を通してより詳細で具体的な質問文を作成していきます。<br><br></li>
            <li><strong>AI回答タブ:</strong><br> 作成した質問に対するAIの回答を表示します。質問を入力し、送信ボタンをクリックすると、AIからの回答が表示されます。<br><br></li>
            <li><strong>ChatGPTタブ:</strong><br> ChatGPTのウェブサイトを直接開くことができます。ボタンをクリックすると、新しいタブで「https://chatgpt.com/」が開きます。既存のAIチャット機能とは別に、ChatGPTとの対話を行うことができます。<br><br></li>
            <li><strong>履歴ボタン:</strong><br> 過去のチャット履歴を確認できます。モーダルウィンドウが表示され、以前のメッセージを閲覧できます。<br><br></li>
            <li><strong>ログアウトボタン:</strong><br> アプリからログアウトします。<br><br></li>
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
      showHistory: false,
      historyData: [],
      showHowToUse: false,
      historyFilter: 'all', // 履歴フィルタリング用
      isDisconnected1: false, // ソケット1の接続状態
      isDisconnected2: false, // ソケット2の接続状態
      loginID: '', // ログインID
    };
  },
  computed: {
    // 履歴データを新しい順にソート
    sortedHistoryData() {
      return this.historyData.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    // フィルターに基づいて履歴データをフィルタリング
    filteredHistoryData() {
      return this.historyFilter === 'all'
        ? this.sortedHistoryData
        : this.sortedHistoryData.filter(entry => entry.tab === this.historyFilter);
    },
  },
  mounted() {
    // ログインIDをローカルストレージから取得
    // this.loginID = localStorage.getItem('loginID') || '';
    // if (!this.loginID) {
    //   // ログインしていない場合、ログインページにリダイレクト
    //   this.$router.push('/login');
    //   return;
    // }
    this.initializeSocket(1);
    this.initializeSocket(2);
    this.loadHistory();
  },
  methods: {
    /**
     * ソケットを初期化しイベントリスナーを設定
     * @param {number} id - 1または2でサーバーURLを選択
     */
    initializeSocket(id) {
      const url = id === 1 ? SERVER_URL_1 : SERVER_URL_2;
      const socket = io(url, {
        query: {
          loginID: this.loginID, // ログインIDをクエリパラメータとして送信
        },
      });
      this[`socket${id}`] = socket;

      socket.on('connect', () => {
        this.addMessage(id, { type: 'system', content: 'サーバーに接続しました' });
        socket.emit('start_interview');
        this[`isDisconnected${id}`] = false; // 接続状態をリセット
      });

      socket.on('disconnect', () => {
        this.addMessage(id, { type: 'system', content: 'サーバーから切断されました' });
        this[`isDisconnected${id}`] = true; // 切断状態を設定
      });

      socket.on('connect_error', error => {
        console.error(`サーバー${id}への接続エラー:`, error);
      });

      socket.on('interview_result', message => {
        this.addMessage(id, { type: 'system', content: message });
        this[`isLoading${id}`] = false;
        this.$nextTick(() => this.$refs[`textarea${id}`]?.focus());
      });
    },

    /**
     * 再接続を試みる
     * @param {number} id - 1または2
     */
    reconnect(id) {
      return new Promise((resolve, reject) => {
        // 既存のソケットがあれば切断
        if (this[`socket${id}`]) {
          this[`socket${id}`].off('connect');
          this[`socket${id}`].off('connect_error');
          this[`socket${id}`].disconnect();
        }

        // ソケットを再初期化
        const url = id === 1 ? SERVER_URL_1 : SERVER_URL_2;
        const socket = io(url, {
          query: {
            loginID: this.loginID, // ログインIDを再送信
          },
        });
        this[`socket${id}`] = socket;

        // イベントリスナーを再設定
        socket.on('connect', () => {
          this.addMessage(id, { type: 'system', content: 'サーバーに再接続しました' });
          socket.emit('start_interview');
          this[`isDisconnected${id}`] = false;
          resolve();
        });

        socket.on('connect_error', error => {
          console.error(`サーバー${id}への再接続エラー:`, error);
          reject(error);
        });

        socket.on('disconnect', () => {
          this.addMessage(id, { type: 'system', content: 'サーバーから切断されました' });
          this[`isDisconnected${id}`] = true;
        });

        socket.on('interview_result', message => {
          this.addMessage(id, { type: 'system', content: message });
          this[`isLoading${id}`] = false;
          this.$nextTick(() => this.$refs[`textarea${id}`]?.focus());
        });
      });
    },

    /**
     * メッセージを会話に追加し、履歴に保存
     * @param {number} id - 1（create）または2（answer）
     * @param {Object} msg - メッセージオブジェクト
     */
    addMessage(id, msg) {
      // msg.content が未定義の場合にデフォルト値を設定
      if (typeof msg.content !== 'string') {
        console.warn('addMessage called with non-string content:', msg);
        msg.content = '';
      }

      const conversations = this[`conversations${id}`];
      const lastConv = conversations[conversations.length - 1];
      if (!lastConv || lastConv.type !== msg.type) {
        conversations.push({ type: msg.type, messages: [msg.content] });
      } else {
        lastConv.messages.push(msg.content);
      }
      this.scrollToBottom(id);

      // 履歴データに追加
      this.historyData.push({
        timestamp: new Date(),
        type: msg.type,
        content: msg.content,
        tab: id === 1 ? 'create' : id === 2 ? 'answer' : 'chatgpt',
      });

      this.saveHistory();
    },

    /**
     * スクロールを最下部に移動
     * @param {number} id - 1または2
     */
    scrollToBottom(id) {
      this.$nextTick(() => {
        const output = this.$refs[`outputArea${id}`];
        if (output) {
          output.scrollTop = output.scrollHeight;
        }
      });
    },

    /**
     * メッセージを送信
     * @param {number} id - 1（create）または2（answer）
     */
    async sendMessage(id) {
      const input = this[`userInput${id}`].trim();
      if (!input) return;

      // 切断されている場合は再接続を試みる
      if (this[`isDisconnected${id}`]) {
        try {
          await this.reconnect(id);
        } catch (error) {
          console.error(`サーバー${id}への再接続に失敗しました:`, error);
          this.addMessage(id, { type: 'system', content: 'サーバーに再接続できませんでした。' });
          return;
        }
      }

      this.addMessage(id, { type: 'user', content: `You: ${input}` });
      this[`socket${id}`].emit('user_input', input);
      this[`userInput${id}`] = '';
      this[`isLoading${id}`] = true;
    },

    /**
     * メッセージをサニタイズ
     * @param {string} message - メッセージ内容
     * @returns {string} サニタイズ済みメッセージ
     */
    sanitizeMessage(message) {
      if (typeof message !== 'string') {
        console.warn('sanitizeMessage called with non-string message:', message);
        return '';
      }
      return message.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '').trim();
    },

    /**
     * ANSIコードをHTMLに変換
     * @param {string} message - メッセージ内容
     * @returns {string} 変換後HTML
     */
    renderAnsiToHtml(message) {
      return marked(this.ansiConvert.toHtml(this.sanitizeMessage(message)));
    },

    /**
     * マークダウンをHTMLに変換
     * @param {string} message - メッセージ内容
     * @returns {string} 変換後HTML
     */
    renderMarkdown(message) {
      return marked(message);
    },

    /**
     * メッセージをレンダリング
     * @param {string} message - メッセージ内容
     * @param {string} type - メッセージタイプ
     * @returns {string} HTMLコンテンツ
     */
    renderMessage(message, type) {
      // messageが未定義の場合は空文字列を渡す
      const safeMessage = typeof message === 'string' ? message : '';
      return type === 'system' ? this.renderMarkdown(safeMessage) : this.renderAnsiToHtml(safeMessage);
    },

    /**
     * ログアウト処理
     */
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
      // ログインIDを削除
      localStorage.removeItem('loginID');
      // ルーターでログアウト
      this.$router.push('/login');
    },

    /**
     * 「使い方」モーダルを開く
     */
    openReadme() {
      this.openHowToUse();
    },

    /**
     * 履歴をロードしバリデーションを行う
     */
    loadHistory() {
      const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
      this.historyData = history.map(entry => ({
        timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
        type: ['user', 'system'].includes(entry.type) ? entry.type : 'system',
        content: typeof entry.content === 'string' ? entry.content : '',
        tab: ['create', 'answer', 'chatgpt'].includes(entry.tab) ? entry.tab : 'create',
      }));
    },

    /**
     * 履歴を保存（システムメッセージを除外）
     */
    saveHistory() {
      const EXCLUDED_SYSTEM_MESSAGES = [
        'AI: プロンプトを一緒に作りましょう。何についてのプロンプトでしょうか？',
        'サーバーに接続しました',
        'AI: ■悩んでいること、相談したいことを教えてください',
        'サーバーから切断されました',
        'セッションがタイムアウトしました。接続を終了します。',
        'セッションがタイムアウトしました。接続を終了します。再度ログインしなおしてください。',
        'ChatGPTを開きました。',
        'サーバーに再接続しました',
      ];

      const filteredHistory = this.historyData.filter(entry =>
        entry.type !== 'system' || !EXCLUDED_SYSTEM_MESSAGES.includes(entry.content)
      );

      localStorage.setItem('chatHistory', JSON.stringify(filteredHistory));
    },

    /**
     * 履歴モーダルを開く
     */
    openHistory() {
      this.loadHistory();
      this.historyFilter = 'all'; // 初期フィルターを「全て」に設定
      this.showHistory = true;
    },

    /**
     * 履歴モーダルを閉じる
     */
    closeHistory() {
      this.showHistory = false;
    },

    /**
     * 「使い方」モーダルを開く
     */
    openHowToUse() {
      this.showHowToUse = true;
    },

    /**
     * 「使い方」モーダルを閉じる
     */
    closeHowToUse() {
      this.showHowToUse = false;
    },

    /**
     * 履歴を削除
     */
    deleteHistory() {
      if (confirm('本当に履歴を削除しますか？')) {
        localStorage.removeItem('chatHistory');
        this.historyData = [];
        alert('履歴が削除されました。');
        this.closeHistory();
      }
    },

    /**
     * ChatGPTを新しいタブで開く
     */
    openChatGPT() {
      window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
      // 履歴に記録する場合は以下を追加
      this.historyData.push({
        timestamp: new Date(),
        type: 'system',
        content: 'ChatGPTを開きました。',
        tab: 'chatgpt',
      });
      this.saveHistory();
    },
  },
  beforeDestroy() {
    this.socket1?.close();
    this.socket2?.close();
  },
};
</script>

<style scoped>
  /* グローバルなリセット */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden; /* 全体のオーバーフローを隠す */
  }

  /* ヘッダーのスタイル */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e5e7eb;
  }

  .user-id {
    font-size: 1em;
    color: #333;
    padding: 5px;
  }

  .header-buttons {
    display: flex;
    gap: 10px;
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

  /* インタビューコンテナのスタイル */
  .interview-container {
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    width: 100%;
    height: 100vh; /* ビューポートの高さに設定 */
    margin: 0 auto;
    padding: 5px;
    background-color: #f5f7fa;
  }

  /* 段落のマージン調整 */
  :deep(p) {
    margin: 2px 0;
  }

  /* タブのスタイル */
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

  /* タブコンテンツのスタイル */
  .tab-content {
    flex: 1 1 auto; /* 残りのスペースを占有 */
    display: flex;
    flex-direction: column;
  }

  /* 各インタビューペインのスタイル */
  .interview {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto; /* 残りのスペースを占有 */
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

  /* インタビューエリアのスタイル */
  .interview-area {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 10px;
    /* height: calc(83vh - 130px); */ /* 固定高さを削除 */
  }

  /* 出力エリアのスタイル */
  .output {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  /* 会話ユニットのスタイル */
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

  /* メッセージのスタイル */
  .message {
    padding: 5px 15px;
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

  /* 入力エリアのスタイル */
  .input-area {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  /* メッセージフォームのスタイル */
  .message-form {
    display: flex;
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
    transition: border-color 0.3s;
    margin-right: 10px;
  }
  .message-form textarea:focus {
    border-color: #0066cc;
    box-shadow: 0 0 5px rgba(0,102,204,0.5);
  }

  /* 送信ボタンのスタイル */
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

  /* 送信アイコンのスタイル */
  .icon-send {
    width: 20px;
    height: 20px;
  }

  /* レスポンシブデザイン: スマートフォン向けスタイル */
  @media (max-width:768px){
    /* インタビューコンテナのパディング調整 */
    .interview-container { 
      padding: 10px; 
    }

    /* インタビューエリアのパディングを縮小 */
    .interview-area { 
      padding: 5px; 
    }

    /* メッセージの最大幅を90%に設定 */
    .message { 
      max-width: 90%; 
    }

    /* メッセージのテキスト揃えを左に設定 */
    .message.system, .message.user { 
      text-align: left; 
    }

    /* テキストエリアのフォントサイズとパディングを調整 */
    .message-form textarea { 
      font-size: 16px; 
      padding: 10px 12px; /* パディングを縮小 */
    }

    /* 送信ボタンのフォントサイズとパディングを調整 */
    .send-button { 
      font-size: 14px; 
      padding: 8px; 
      width: 40px; 
      height: 40px; 
    }

    /* アイコンのサイズを調整 */
    .icon-send { 
      width: 16px; 
      height: 16px; 
    }

    /* ヘッダーのタイトルフォントサイズを調整 */
    .interview header h2 { 
      font-size: 1.2em; 
    }

    /* タブのフォントサイズとパディングを調整 */
    .tab { 
      font-size: 1em; 
      padding: 10px 15px; 
    }

    /* ヘッダー全体のレイアウト調整: 折り返しを防止 */
    .header {
      flex-wrap: nowrap; /* 折り返しを防止 */
    }

    /* ユーザーIDのスタイル調整 */
    .user-id {
      font-size: 0.9em; /* フォントサイズを縮小 */
      padding: 5px;
      flex-shrink: 1; /* 縮小可能に設定 */
      white-space: nowrap; /* 折り返し防止 */
      overflow: hidden; /* オーバーフローを隠す */
      text-overflow: ellipsis; /* 省略記号を表示 */
    }

    /* ヘッダーボタンコンテナの隙間を縮小 */
    .header-buttons {
      display: flex;
      gap: 5px; /* ボタン間の隙間を縮小 */
    }

    /* ヘッダーボタンのスタイル調整 */
    .header-buttons button {
      padding: 6px 10px; /* パディングを縮小 */
      font-size: 0.8em; /* フォントサイズを縮小 */
      white-space: nowrap; /* 折り返し防止 */
      min-width: 60px; /* ボタンの最小幅を設定 */
    }

    /* モーダルコンテンツのパディングを調整 */
    .modal-content {
      padding: 15px;
    }

    /* 履歴モーダルのテキストサイズ調整 */
    .history-entry p {
      font-size: 0.9em;
    }

    /* その他の要素の調整が必要な場合はここに追加 */
  }

  /* ローディングスピナーのスタイル */
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

  /* 言語選択のスタイル */
  .language-select {
    margin-top: 10px;
    padding: 5px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
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
    transition: border-bottom 0.3s, background-color 0.3s;
  }
  .history-tab:hover {
    background-color: #f0f4f8;
  }
  .history-tab.active {
    border-bottom: 2px solid #0066cc;
    font-weight: bold;
    color: #0066cc;
  }

  /* ChatGPTタブ用のボタンスタイル */
  .open-chatgpt-button {
    padding: 15px 30px;
    background-color: #0066cc;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s;
  }
  .open-chatgpt-button:hover {
    background-color: #005bb5;
  }
  .chatgpt-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .chatgpt-note {
    margin-top: 15px;
    font-size: 0.9em;
    color: #666;
    text-align: center;
  }

</style>
