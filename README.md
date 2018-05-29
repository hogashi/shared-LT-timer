# shared-LT-timer

管理1人 : 閲覧99人 (Firebaseの制限のため) の共有LTタイマーです。

https://hogashi.github.io/shared-LT-timer で公開しています。

## 使い方

### 管理者

gh-pagesで公開する場合を書いています。

1. リポジトリをforkする
1. `yarn install`
1. Firebaseのアプリを作成し、メールアドレスとパスワードでログイン可能な管理者用ユーザをつくる
1. 「Project Overview」の「ウェブアプリにFirebaseを追加」で出るコードの `config` 部分で `components/constants.js` の該当部分を書き換える
1. `yar build` の後に `docs/` 内のファイルを `yarn deploy` で公開する
1. 該当ページにアクセスし、上で作ったユーザでログインする
1. 閲覧者にURLを共有する
1. 操作方法にしたがって操作する

### 閲覧者

1. URLにアクセスする

## 注意

管理者2人の状態に対応していないので、その場合思わぬ挙動をします。

