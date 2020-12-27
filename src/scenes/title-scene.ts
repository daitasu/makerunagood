export class TitleScene extends Phaser.Scene {
  constructor() {
      //識別ID設定のみ
      super({
          key: "TitleScene"
      });
  }

  //本来はこのメソッドで、画像ファイルなどのロード
  preload(): void {
      //今回はコンソール表示だけ
      console.log("Hello Phaser");
  }
}