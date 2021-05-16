# Google Spread Sheet Lineworks Bot

## 概要
楽に無料で使えるLineworks FAQ Botです.  
バグあったら、issueならプルリクください.  
※このコードは無保証です。一切の損害に対して何の責任も負いません。

## 準備

### Lineworks側
1. https://developers.worksmobile.com/jp/console/openapi/main にアクセスする.
1. 公式サイトの手順を参考に必要なキーを発行する. https://developers.worksmobile.com/jp/document/1002002?lang=ja
    - API ID
    - Service API Consumer Key
    - Server Token (ID 登録タイプ) ※ダウンロードすること
1. https://developers.worksmobile.com/jp/console/bot/form にアクセスしBotを登録する.
    - 必須
        - Bot名
        - 管理者
    - 必要応じてその他も設定する.

### Google SpreadSheet側
1. https://docs.google.com/spreadsheets/u/0/?tgif=d にアクセスし、Spreadsheetを新規作成する(名前はなんでもOK).
1. 以下の解凍パターンシートを作成する.
    - start シート
        - A1セルにBot呼び出し時のWELCOMEメッセージを入力する
    - buttonTemplate シート
        | postback | button | contentText |
        | ---- | ---- |---- |
        |start|数学|メニュー|
        |start|英語|メニュー|
        |start|歴史|メニュー|
        |start|次のページ|メニュー|
        |次のページ|体育|メニュー|
        |次のページ|図工|メニュー|
        |数学|メトロノームの数式|数学|
        |数学|数学の点数教えて|数学|
        |数学|直接問い合わせる|数学|
    - help シート
        |キーワード|メッセージ|主担当|副担当|シート|
        |----|----|----|----|----|
        |数学|直接聞いてください|hoge@lineworksid|fuga@lineworksid||
        |英語|直接聞いてください|hoge@lineworksid|fuga@lineworksid||
        |歴史|直接聞いてください|hoge@lineworksid|fuga@lineworksid||
        |体育|直接聞いてください|hoge@lineworksid|fuga@lineworksid||
        |メトロノーム|https://www.cs.miyazaki-u.ac.jp/~date/paper-files/date4ppm20110207.pdf|hoge@lineworksid|fuga@lineworksid||
        |.*数学.*点数.*||||test|
        |数学|直接問い合わせる|hoge@lineworksid|fuga@lineworksid||
    - test シート（help シートのシート列）
        | アカウントID | 点数 | 評価 |
        | ---- | ---- |---- |
        |hoge@lineworksid|数学の点数は100点です。|よくできました。|
        |fuga@lineworksid|数学の点数39点です。|赤点です。|
    - log シート
1. SpreadSheetのメニューからツール→スクリプトエディタをクリックする.
1. プロジェクト名を適当に設定する.
1. gasLineworksBot.js のコード貼り付けて、環境変数を設定する.
    - var apiId = ""; // 発行したAPI ID
    - var consumerKey = ''; // 発行したServer API Consumer Key 
    - var serverId = ''; // Server List(ID登録タイプ) のID
    - var privateKey = '-----BEGIN PRIVATE KEY-----\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n-----END PRIVATE KEY-----'; // ダウンロードした証明書の改行を\nに置換して貼り付ける
    - var botNo = 0; // 作成したBotのID
    - var nortifyUser = ''; // bot管理者のID（なんとか@かんとか）
1. 右上のデプロイ → 新しいデプロイ → ウェブアプリ を選択する.
1. 新しいデプロイ で説明文を入力、アクセスできるユーザを「全員」に設定してデプロイをクリックする.
1. 「アクセス許可を承認」をクリックする.
1. 自分のアカウントをクリックする.
1. 許可を求めてくるので「許可」をクリックする.
1. ウェブアプリの URL が表示されるのでコピーする。

## LineworkBotの設定
1. 作成したBotを選択し、「修正」をクリックする.
1. Callback URLを「on」に変更する。
1. callback URL に Spreadsheetでデプロイしたウェブアプリの URLを入力する。
1. メンバーが送信可能なメッセージタイプ でテキストをチェックする.
1. 「保存」をクリックする。

## LineworksAdmin設定
1. Botの管理画面にアクセスする. https://admin.worksmobile.com/service/bot
1. Bot追加をクリックする。
1. 対象のBotを選択し、 メンバー指定 でメンバーを設定する.
1. 公開設定 をチェックする.

## Bot利用開始
1. サービス通知からBot追加通知が来ているので、「Botを利用」をクリックする.
1. 「利用開始」をクリックする.
1. ボタンを選択する or キーワードを入力すると回答が返ってくる。

## 機能
- helpシートに記載した回答を返す.
- 初期表示として、buttonTemplate のA列のstartを記載したメニューを表示する.
- helpシートB列が「直接問い合わせる」の場合、トークルームを作成する（1:N にBotが招待できる状態にすること）.
- logシートに呼び出し情報を記録する.
- helpシートE列に記載のシートが存在する場合、ユーザ個別の回答を送ることができる.
