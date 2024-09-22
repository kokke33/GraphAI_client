import { createApp } from 'vue';
import App from './App.vue';
import Interview from './components/Interview.vue';
import Login from './components/Login.vue';
// import HowToUse from './components/HowToUse.vue'; // HowToUseコンポーネントをインポート
import { createRouter, createWebHistory } from 'vue-router';

// ルート定義
const routes = [
  { path: '/', component: Login },
  { path: '/interview', component: Interview },
  // { path: '/how-to-use', component: HowToUse } // 新しい「使い方」ページのルート
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.component('Interview', Interview);
app.component('Login', Login);
// app.component('HowToUse', HowToUse); // 新しいコンポーネントを登録
app.mount('#app');