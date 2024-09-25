<!-- Login.vue -->
<template>
  <div class="login-page">
    <div class="login-container">
      <h2>ログイン</h2>
      <h4>無料試作期間中</h4>
      <h5>During the free trial period</h5>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">ユーザー名(user1)</label>
          <input
            type="text"
            v-model="username"
            id="username"
            required
            placeholder="ユーザー名"
          />
        </div>
        <div class="form-group">
          <label for="password">パスワード(user1)</label>
          <input
            type="password"
            v-model="password"
            id="password"
            required
            placeholder="パスワード"
          />
        </div>
        <button type="submit" class="login-button">ログイン</button>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
      // サンプルユーザーのリスト（画面表示しません）
      sampleUsers: [
        { username: 'tss', password: 'tsstss' },
        { username: 'user1', password: 'user1' },
        { username: 'user2', password: 'password2' },
        { username: 'user3', password: 'password3' },
        { username: 'user4', password: 'password4' },
      ],
    };
  },
  methods: {
    handleLogin() {
      const { username, password, sampleUsers } = this;
      // 入力されたユーザー名とパスワードがサンプルユーザーのどれかに一致するか確認
      const user = sampleUsers.find(
        (user) => user.username === username && user.password === password
      );
      if (user) {
        // 認証成功時の処理
        // ログインID（ユーザー名）をローカルストレージに保存
        localStorage.setItem('loginID', user.username);
        this.$router.push('/interview');
      } else {
        // 認証失敗時の処理
        this.error = 'ユーザー名またはパスワードが間違っています';
      }
    },
  },
};
</script>

<style scoped>
/* 背景全体のスタイリング */
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 98vh;
  background-color: #f2f2f2;
  padding: 20px;
  box-sizing: border-box;
}

/* ログインカードのスタイリング */
.login-container {
  background-color: #ffffff;
  padding: 30px 25px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 350px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* タイトルのスタイリング */
.login-container h2 {
  margin-bottom: 20px;
  font-size: 1.8em;
  color: #333;
  text-align: center;
}

/* フォームグループのスタイリング */
.form-group {
  margin-bottom: 15px;
}

/* ラベルのスタイリング */
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-size: 1em;
}

/* 入力フィールドのスタイリング */
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #0066cc;
  outline: none;
}

/* ログインボタンのスタイリング */
.login-button {
  width: 100%;
  padding: 10px;
  background-color: #0066cc;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #005bb5;
}

.login-button:active {
  background-color: #004a99;
}

/* エラーメッセージのスタイリング */
.error-message {
  margin-top: 15px;
  color: #d93025;
  font-size: 0.9em;
  text-align: center;
}

/* レスポンシブデザイン */
@media (max-width: 480px) {
  .login-container {
    padding: 25px 20px;
  }

  .login-container h2 {
    font-size: 1.5em;
  }

  .form-group input {
    padding: 9px 10px;
    font-size: 0.95em;
  }

  .login-button {
    padding: 9px;
    font-size: 0.95em;
  }
}
</style>
