//必要なimport
import "phaser";
import { Preload } from "./scenes/preload";
import { Game } from "./scenes/game";
//ゲームの基本設定
const config: Phaser.Types.Core.GameConfig = {
  title: "nojimadayo", //タイトル
  version: "1.0.1", //バージョン
  width: 800, //画面幅
  height: 600, //画面高さ
  parent: "game", //DOM上の親
  type: Phaser.AUTO, //canvasかwebGLかを自動選択
  // アーケード物理システムを利用することを示す
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

//ゲームメインのクラス
export class Main extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config); // Phaser.Gameクラスにconfigを渡す

    // シーンにキーを割り振って登録
    this.scene.add("preload", Preload, false);
    this.scene.add("game", Game, false);

    // シーンをスタート
    this.scene.start("preload");

    console.log("main ->", this);
  }
}

//windowイベントで、ロードされたらゲーム開始
window.addEventListener("load", () => {
  new Main(config);
});
