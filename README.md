<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h2>Discordスパムボットの機能</h2><h3>配信者のDiscordServerで荒らしが来るようになったので作成してみたものになりますので不備があります。</h3>
    <ul>
        <li>
            <strong>スパム検知:</strong>
            <ul>
                <li>ユーザーが短期間に多数のメッセージを送信した場合、スパムと見なします。</li>
            </ul>
        </li>
        <li>
            <strong>警告処理:</strong>
            <ul>
                <li>警告回数が一定数以上に達すると、ユーザーに対して警告を発し、必要に応じてミュートを行います。</li>
            </ul>
        </li>
        <li>
            <strong>ミュート処理:</strong>
            <ul>
                <li>ユーザーがミュートされます。ミュートは一定時間続き、その間はチャットやリアクション、ボイスチャンネルへの接続が制限されます。</li>
            </ul>
        </li>
        <li>
            <strong>ログ削除:</strong>
            <ul>
                <li>ユーザーがサーバーからBanされた際、そのユーザーの過去のメッセージ（最大7日間）を削除します。※今はなし</li>
            </ul>
        </li>
    </ul>
</body>
</html>


<B>連投の設定<B/><br>
 const spamThreshold = 5; // メッセージ数<br>
 const timeWindow = 10000; // 時間 (ミリ秒):10秒に5件くると判定<br>
 const warningThreshold = 3; // 警告回数:2回警告して3回目で「Muted」付与<br>
 const muteDuration = 60 * 60 * 1000; // ミュートの期間 (ミリ秒)：1時間でBAN等の対応の猶予<br>
 10分の場合10 * 60 * 1000のように変更可能<br>
 <br>
 .envにBOTのトークンを入れて動かしてみてください。

