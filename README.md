## 作成中
ダイエットからシステム開発、人生相談に至るまであらゆる悩みの解決方針を提案します！

問題を抱える人々向けの、問題解決支援システムです。

これは、プロンプトエンジニアリングと対話型AI問題解決を組み合わせたもので、従来の単純なAIチャットボットとは異なり、ユーザーの問題に対して、段階的にプロンプトを最適化し、複数の解決策を生成・評価・選定する機能を提供します。

さらに、選ばれた解決策に基づいて次の重要な質問を提案し、問題解決プロセスを継続的に深化させます。
これにより、ユーザーは高品質な問題解決アプローチを効率的に得ることができます。

## github
```
git pull origin main
git add .
git commit -m "コミットメッセージ"
git push origin main
```

# FireBase
FireBaseをインストール。
開発環境がReplitの場合は「--no-localhost」が好き。
```
 npx firebase-tools login --no-localhost
```

## デプロイ
必要に応じて再ログイン
```
firebase login --no-localhost
```
```shell
npm run build
npx firebase deploy
```

```shell
~/GraphAIclient$ firebase init

     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  /home/runner/GraphAIclient

? Which Firebase features do you want to set up for this directory? Press Space to select features, then 
Enter to confirm your choices. Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub 
Action deploys

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add, 
but for now we'll just set up a default project.

? Please select an option: Use an existing project
? Select a default Firebase project for this directory: graphai2 (GraphAI2)
i  Using project graphai2 (GraphAI2)

=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No
? File dist/index.html already exists. Overwrite? No
i  Skipping write of dist/index.html

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...

✔  Firebase initialization complete!
~/GraphAIclient$ npm run build

> vuejs-with-vite@0.0.0 build
> vite build

vite v4.5.5 building for production...
transforming (23) node_modules/@vue/devtools-api/lib/esm/proxy.js[@vue/compiler-sfc] ::v-deep usage as a combinator has been deprecated. Use :deep(<inner-selector>) instead.

✓ 83 modules transformed.
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-9fa132b7.css    8.98 kB │ gzip:  2.05 kB
dist/assets/index-f86216e1.js   218.42 kB │ gzip: 83.70 kB
✓ built in 1.40s
~/GraphAIclient$ firebase deploy

=== Deploying to 'graphai2'...

i  deploying hosting
i  hosting[graphai2]: beginning deploy...
i  hosting[graphai2]: found 4 files in dist
✔  hosting[graphai2]: file upload complete
i  hosting[graphai2]: finalizing version...
✔  hosting[graphai2]: version finalized
i  hosting[graphai2]: releasing new version...
✔  hosting[graphai2]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/graphai2/overview
Hosting URL: https://graphai2.web.app
~/GraphAIclient$ 
```
