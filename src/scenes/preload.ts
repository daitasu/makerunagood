import * as Phaser from "phaser";

export class Preload extends Phaser.Scene {
  private startText?: Phaser.GameObjects.Text; // 追加

  private bk_color = "#72ADD0"; // 追加
  private fontStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    color: "#FFF",
    fontSize: "70px",
  };

  init() {
    console.log("Preloading");
  }

  preload() {
    console.log("Load things necessary for Game scene");
  }

  create() {
    this.cameras.main.setBackgroundColor(this.bk_color);
    this.startText = this.add.text(400, 300, "START", this.fontStyle);

    this.startText.setOrigin(0.5);

    this.startText.setInteractive();
    this.startText.on("pointerdown", () => {
      this.scene.start("game");
    });
  }
}
