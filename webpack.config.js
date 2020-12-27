//パス名の生成
const path = require("path");
const pathToPhaser = path.join(__dirname, "/node_modules/phaser/");
const phaser = path.join(pathToPhaser, "dist/phaser.js");

//webpackの出力設定
module.exports = {
  mode: "development",
  //実行開始地点となるファイル
  entry: './src/main.ts',
  //出力先
  output: {
      //カレントパス/dist
      path: path.resolve(__dirname, "dist"),
      //出力ファイル名
  filename: "bundle.js"
  },
  //依存関係解決の対象とするモジュール
  module: {
    rules: [
      //*.ts なファイルはts-loaderに処理を依頼。但し/node_modules/内は除く
      { test: /\.ts$/, loader: "ts-loader", exclude: "/node_modules/" },
      //phaser.jsなファイルはexposer-loaderに処理を依頼。phaserをグローバルオブジェクトとして出力
      {
        test: /phaser\.js$/,
        loader: "expose-loader",
        options: {
          exposes:['phaser']
        }
      }
    ]
  },
  //webpack-dev-serverの起動設定
  devServer: {
    contentBase: path.resolve(__dirname, "./"),
    publicPath: "/dist/",
    host: "127.0.0.1",
    port: 9000,
    open: true
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      phaser: phaser
    }
  }
};