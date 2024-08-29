import { createApp } from 'vue';
import App from './App.vue';
import Interview from './components/Interview.vue'; // Interviewコンポーネントをインポート

const app = createApp(App);
app.component('Interview', Interview); // Interviewコンポーネントを登録
app.mount('#app');
