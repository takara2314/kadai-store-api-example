# 🎒 Kadai Store API
[devoirs-core](https://github.com/approvers/devoirs-core) を使用して [Microsoft Teams](https://www.microsoft.com/ja-jp/microsoft-365/microsoft-teams/group-chat-software/)(Microsoft 365 Education) で出されている課題の情報を取得し、APIを提供します。
この場をお借りして devoirs-core、Devoirs の開発に関わった方々に感謝申し上げます。


## ⚠ 注意
``Kadai Store API`` は ``TCJ2 Kadai Store API`` が大幅改良され、改名されたものです。前のバージョンのAPIを使用する場合は、[TCJ2 Kadai Store APIのレポジトリ](https://github.com/takara2314/tcj2-kadai-store-api)を参照してください。


## 👨‍💻 API利用方法 (クライアント)
### 課題一覧を取得 — GET /get
#### Parameters (Option)
| Parameter |   |
|:----------|:-:|
| due       | 提出期限が過ぎているものを除く場合は、`future`を入れてください。 |
| timezone  | 予め設定されているタイムゾーンから、タイムゾーンを指定して取得することができます。それ以外はUTCとなります。 |
| subject   | 予め設定されている教科IDから、教科を指定して取得することができます。複数ある場合はコンマで区切ってください。 |

タイムゾーンや教科IDは、`api-config.yaml`で指定できます。API提供者は、クライアントにそれらをお伝えください。
#### Curl Example
```Bash
$ curl http://example.com/get?due=future&timezone=Asia/Tokyo&subject=math4,circuit2,ai-basic \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
#### Response Example
```JSON
{
  "acquisition": "2020-04-01T12:34:56+09:00",
  "homeworks": [
    {
      "course": "[099] 2年生 AI基礎",
      "subject": "AI基礎",
      "subject_id": "ai-basic",
      "name": "第7回課題 (Deep Q Network)",
      "id": "abcdefgh-0123-4567-8910-ijklmnopqrst",
      "due": "2020-04-13T23:59:59+09:00"
    }
  ]
}
```
`acquisition` はMS Teamsから取得した時刻です。

### 教科ID一覧を取得 — GET /subjects
#### Curl Example
```Bash
$ curl http://example.com/subjects \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
#### Response Example
```JSON
{
  "subjects": [
    "hr",
    "japanese",
    "math3",
    "physics-b",
    "law2",
    "le1",
    "eikaiwa1",
    "algorithm",
    "web",
    "circuit",
    "dog",
    "cat"
  ]
}
```


## ✔ 前提 (サーバー)
- Node.js 11.7.0+ (Recommend: 14.0.0+)


## 🛠 環境構築 (サーバー)
### 1. Node.js を実行できる環境を用意します。
Node.js のコードを実行・運用できる環境（サーバーやホスティングなど）を用意してください。

### 2. Kadai Store API をインストールします。
[Releases](https://github.com/takara2314/kadai-store-api/releases)から最新版のソースコードをダウンロードして、展開してください。

### 3. インストールしたディレクトリに移動します。
移動してください。

### 4. api-config.yaml で基本的な設定を行います。
| Keys               |   |
|:-------------------|:-:|
| update_duration    | `MS Teams`から課題情報を取得する、時間の間隔(分) |
| update_offtimes    | `MS Teams`から課題情報を取得しない、時(hour) |
| get_limit          | 1つのトークンが、`get_limit_duration`で指定する期間内に、このAPI(/get)にGETできる回数 |
| get_limit_duration | `get_limit`の期間(分) |
| tmp-dir            | 一時的なデータを保管するディレクトリ |
| timezones          | UTC(協定世界時)以外に扱うタイムゾーン |
| subjects           | 取得する課題が格納されているチーム名、教科名、教科ID |
| allow-tokens       | APIにアクセスを許可するトークン (ここで定めてください) |

### 5. 環境変数を設定します。
| Variables          |   |
|:-------------------|:-:|
| PORT               | サーバーが使用するポート番号 (`Heroku`や`GAE`等のホスティングサービスを使用する場合は設定不要です) |
| MICROSOFT_EMAIL    | 課題情報を取得する`MS Teams`のアカウントのメールアドレス |
| MICROSOFT_PASSWORD | 課題情報を取得する`MS Teams`のアカウントのパスワード |

### 6. JavaScriptにコンパイル
`npm install`を実行して、必要なモジュールをインストールしてください。(少々時間がかかります)

次に、`npm run build`を実行して、src内のTypeScriptのコードをJavaScriptにコンパイルし、実行できる状態にしましょう。

### 7. (`Heroku`や`GAE`等のホスティングサービスを使用する場合) デプロイします。
デプロイに必要なファイルを追加して、デプロイしてください。

#### 🔎 デブロイが失敗する場合
`Chromium(Puppeteer)`を使用しているので、ホスティングサービスによっては、デプロイが失敗することがあります。想定される理由として、メモリ不足や、必要なアドオンが導入されていないことが考えられます。

|  |  |
|:-|:-|
| 最小メモリ | 512MB |
| 推奨メモリ | 1024MB |

### 7. (ホスティングサービスを使用しない場合) 実行します。
`npm start`を実行して、サーバーを起動します。

`ts-node`を使用してTypeScriptを直接実行できる方は、`npm run dev`でもサーバーを起動することができます。

### 8. アクセスできるかを確かめる
アクセスしてみてください。`Kadai Store API - v1.0.2`と表示されたら成功です。