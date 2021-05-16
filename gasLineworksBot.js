/*
 * 環境変数
 */
var apiId = ""; // 発行したAPI ID
var serverId = '';
var consumerKey = ''; // 発行したServer API Consumer Key 
var privateKey = '-----BEGIN PRIVATE KEY-----\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n-----END PRIVATE KEY-----'; // ダウンロードした証明書の改行を\nに置換して貼り付ける
var botNo = 0; // 作成したBotのID
var nortifyUser = ''; // 管理者のID（なんとか@かんとか）
var token = getServerToken(getJwtToken());

/**
 * Lineworksからのコールバック受付
 */
function doPost(e) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('log');
  var nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1).setValue(Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'));

  if (e == null || e.postData == null || e.postData.contents == null) {
    sheet.getRange(nextRow, 3).setValue('エラー発生' + e);
    sendText(nortifyUser, 'エラー発生');
    return;
  }

  var contents = JSON.parse(e.postData.contents);
  var accountId = contents.source.accountId;

  sheet.getRange(nextRow, 2).setValue(accountId);
  sheet.getRange(nextRow, 3).setValue(contents.content.text);

  if (contents.content.postback == 'start' ||
    contents.content.text == '?' ||
    contents.content.text == 'ヘルプ' ||
    contents.content.text == 'help') {
    // startシートのメッセージをユーザに送る
    sendText(
      accountId,
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('start').getRange('A1').getValue()
    );
    // 選択肢のメッセージをユーザに送る
    sendButtonTemplate(accountId, 'start');
    return;
  }

  sendButtonTemplate(accountId, contents.content.text);
  sendText(accountId, contents.content.text, contents.content.postback);
  return;
}

/**
 * 選択肢ボタンメッセージの送信
 */
function sendButtonTemplate(accountId, text) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('buttonTemplate');
  var lastRow = sheet.getLastRow();
  var actions = [];
  var contentText = '';
  for (var i = 2; i <= lastRow; i++) {
    if (sheet.getRange(i, 1).getValue() == text) {

      contentText = sheet.getRange(i, 3).getValue()
      actions.push({ "type": "message", "label": sheet.getRange(i, 2).getValue(), "postback": sheet.getRange(i, 3).getValue() });
    }
  }

  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json;charset=UTF-8',
      'consumerKey': consumerKey,
      'Authorization': 'Bearer ' + token,
    },
    'payload': JSON.stringify({
      "accountId": accountId,
      "content": {
        "type": "button_template",
        "contentText": contentText,
        "actions": actions
      }
    }),
    'muteHttpExceptions': true,
  };

  var res = UrlFetchApp.fetch('https://apis.worksmobile.com/r/' + apiId + '/message/v1/bot/' + botNo + '/message/push', options);
  Logger.log(res)
}

/**
 * IDから取得する
 */
function getVLID(accountId, sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var lastRow = sheet.getLastRow();
  for (var i = 2; i <= lastRow; i++) {
    if (sheet.getRange(i, 1).getValue() == accountId) {
      return sheet.getRange(i, 2).getValue() + '\n' + sheet.getRange(i, 3).getValue();
    }
  }
  return 'IDが存在しません'
}

/**
 * SpreadSheetからメッセージを取得する
 */
function getMessage(accountId, talkMessage, postback) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('help');
  var lastRow = sheet.getLastRow();
  for (var i = 2; i <= lastRow; i++) {


    var regexp = new RegExp(sheet.getRange(i, 1).getValue(), 'g');
    if (talkMessage == '直接問い合わせる') {
      if (postback == sheet.getRange(i, 1).getValue()) {
        // トークルームを作成する

        const options = {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json;charset=UTF-8',
            'consumerKey': consumerKey,
            'Authorization': 'Bearer ' + token,
          },
          'payload': JSON.stringify({
            "accountIds": [accountId, sheet.getRange(i, 3).getValue(), sheet.getRange(i, 4).getValue()],
            "title": talkMessage + 'ヘルプデスク' + accountId
          }),
          'muteHttpExceptions': true,
        };

        var res = UrlFetchApp.fetch('https://apis.worksmobile.com/r/' + apiId + '/message/v1/bot/' + botNo + '/room', options);
        Logger.log(res)

      }
      continue;
    }

    if (talkMessage.match(regexp)) {
      if (sheet.getRange(i, 5).getValue() != '') {
        // ユーザ単位での処理
        return getVLID(accountId, sheet.getRange(i, 5).getValue());
      }

      return sheet.getRange(i, 2).getValue() +
        '\n\n問合先1 ' + sheet.getRange(i, 3).getValue() +
        '\thttps://contact.worksmobile.com/v2/organization/chart?keyword=' + encodeURI(sheet.getRange(i, 3).getValue()) +
        '\n問合先2 ' + sheet.getRange(i, 4).getValue() +
        '\thttps://contact.worksmobile.com/v2/organization/chart?keyword=' + encodeURI(sheet.getRange(i, 4).getValue())
    }
  }
  return talkMessage;
}

/**
 * テキスト送信
 */
function sendText(accountId, talkMessage) {
  var msg = getMessage(accountId, talkMessage);

  if (talkMessage == msg) {
    return;
  }

  var content = {
    "type": "text",
    "text": msg
  };

  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json;charset=UTF-8',
      'consumerKey': consumerKey,
      'Authorization': 'Bearer ' + token,
    },
    'payload': JSON.stringify({
      "botNo": botNo,
      "accountId": accountId,
      "content": content
    }),
    'muteHttpExceptions': true,
  };

  var res = UrlFetchApp.fetch('https://apis.worksmobile.com/' + apiId + '/message/sendMessage/v2', options);
  Logger.log(res)
}


/**
 * サーバートークンの取得
 */
function getServerToken(jwtToken) {
  const uri = 'https://auth.worksmobile.com/b/' + apiId + '/server/token';
  const payload = {
    "grant_type": encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer"),
    "assertion": jwtToken
  };
  const options = {
    'method': 'post',
    'headers': { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    "payload": payload
  };
  const body = UrlFetchApp.fetch(uri, options);

  Logger.log(JSON.parse(body).access_token)
  return JSON.parse(body).access_token;
}

/**
 * JWTトークンの取得
 */
function getJwtToken() {
  const header = Utilities.base64Encode(JSON.stringify({ "alg": "RS256", "typ": "JWT" }), Utilities.Charset.UTF_8);
  const claimSet = JSON.stringify({
    "iss": serverId,
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000 + 2000)
  });
  const encodeText = header + "." + Utilities.base64Encode(claimSet, Utilities.Charset.UTF_8).slice(0, -2);
  const signature = Utilities.computeRsaSha256Signature(encodeText, privateKey);
  const jwtToken = encodeText + "." + Utilities.base64Encode(signature).slice(0, -2);
  return jwtToken;
}