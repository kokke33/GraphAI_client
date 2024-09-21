import { createApp } from 'vue';
import App from './App.vue';
import Interview from './components/Interview.vue';
import Login from './components/Login.vue'; // Loginコンポーネントをインポート
import { createRouter, createWebHistory } from 'vue-router';

// ルート定義
const routes = [
  { path: '/', component: Login },
  { path: '/interview', component: Interview }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.component('Interview', Interview);
app.component('Login', Login);
app.mount('#app');