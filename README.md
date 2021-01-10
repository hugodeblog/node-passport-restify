# Node.jsでWebApp+認証サーバーを作る

https://github.com/hugodeblog/node-restify-sequelize
に作ったRestifyによるユーザー認証サーバーを利用して、

以下のようなWebApp+認証サーバーの組み合わせのフローを実現するサンプルである。

![処理フロー](https://github.com/hugodeblog/node-passport-restify/blob/images/088D6202C6A5B79860F0F43E2BAE571C.jpg)

主に以下のモジュールを用いて、ユーザー情報をSQLite3のDBに保存して、Restifyによるユーザー認証APIサーバーを構築するサンプル。

それぞれで主に使っているパッケージ、モジュールは

* UserAuthServer
  * restify
  * sequelize
  * sqlite3
  * bcrypt
  * joi
* WebApp
  * express
  * passport
  * redis

本リポジトリはWebAppのみを含んでいるので、動作させるには、
https://github.com/hugodeblog/node-restify-sequelize
で作ったUserAuthServerにあたるユーザー認証サーバーのソースコードを別途取得する必要がある。

## 実行手順

本サンプルのWebAppはセッションの保存にRedisサーバーを用いる。Macであれば、brewなどを利用してRedisを事前にインストールしておく必要がある。

```txt
$ brew install redis
```

インストールが完了したらRedisサーバーを起動させておく。

```txt
$ redis-server
```

次にユーザー認証サーバー(UserAuthServer)を立ち上げるため、
https://github.com/hugodeblog/node-restify-sequelize
から入手した認証サーバーを起動させる。

```txt
$ BASIC_AUTH_USER=test BASIC_AUTH_PASS=password npm run start-server

> node-restify-sequelize@1.0.0 start-server
> DEBUG=db:*,users:* node ./user-server.mjs

  users:log Rest-API-Test listening at http://127.0.0.1:4000 +0ms
```
これで4000番ポートでユーザー認証サーバーが起動する。

あとは本リポジトリから入手したWebAppを起動させれば良い。

```txt
$ BASIC_AUTH_USER=test BASIC_AUTH_PASS=password npm run start

> node-passport@0.0.0 start
> node ./app.mjs

Listening on port 3000
Connected to redis successfully
```

これで3000番ポートでWebAppが待ち受け状態となる。

実際の動作状況は以下のようになる。

![動作チェック](https://github.com/hugodeblog/node-passport-restify/blob/images/passport-restify.gif)
