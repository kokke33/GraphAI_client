// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

// ESモジュールで __dirname を使用するためのヘルパー
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数 PORT を取得。なければ 4173 を使用
const PORT = process.env.PORT || 4173;

// dist フォルダの静的ファイルを提供
app.use(express.static(path.join(__dirname, 'dist')));

// クライアントサイドルーティングのため、存在しないルートは index.html にリダイレクト
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});