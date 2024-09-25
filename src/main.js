// main.js
import { createApp } from 'vue';
import App from './App.vue';
import Interview from './components/Interview.vue';
import Login from './components/Login.vue';
import { createRouter, createWebHistory } from 'vue-router';

// ルート定義
const routes = [
  { path: '/', redirect: '/interview' }, // ルートにアクセスしたら /interview にリダイレクト
  // { path: '/login', component: Login }, // ログイン画面をコメントアウト
  { path: '/interview', component: Interview }
  // 他のルートがあればここに追加
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app');