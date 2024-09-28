// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import history from 'connect-history-api-fallback'; // 追加

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORSの設定（必要であれば）
app.use(cors());

// historyモードのためのミドルウェアを適用（静的ファイルの提供より前）
app.use(history());

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'dist')));

// サーバーの起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
