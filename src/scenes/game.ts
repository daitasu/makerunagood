import * as Phaser from "phaser";

type Platforms = Phaser.Physics.Arcade.StaticGroup;
type DynamicGroup = Phaser.Physics.Arcade.Group;
type DynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
type Player = DynamicBody;
type Keyboard = Phaser.Types.Input.Keyboard.CursorKeys;
type Text = Phaser.GameObjects.Text;

export class Game extends Phaser.Scene {
  private platforms: Platforms;
  private player: Player;
  private stars: DynamicGroup;
  private bombs: DynamicGroup;
  private cursors: Keyboard;
  private score: number;
  private gameOver: boolean;
  private scoreText: Text;
  private starList: DynamicBody[];

  init(): void {
    this.score = 0;
    this.gameOver = false;
    this.starList = [];
  }

  preload(): void {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(): void {
    this.add.image(400, 300, "sky");

    /*
     * プラットフォームの作成
     */
    this.platforms = this.physics.add.staticGroup();

    // 画像をスケールした際はrefreshBody()を呼ぶ必要がある。
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    /*
     * プレイヤーの設置
     */
    this.player = this.physics.add.sprite(100, 450, "dude");
    // バウンド値の設定
    this.player.setBounce(0.2);
    // このインスタンスが世界(Canvas領域)に対し衝突判定を持つかどうか
    this.player.setCollideWorldBounds(true);

    /*
     * プレイヤーの動き
     */
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // キーボードマネージャーを利用するための宣言
    this.cursors = this.input.keyboard.createCursorKeys();

    // 星の設置
    this.stars = this.physics.add.group();

    for (let i = 0; i < 4; i++) {
      this.starList.push(this.stars.create(0, 0, "star", 0, false, false));
    }

    this.time.addEvent({
      delay: 5000,
      timeScale: 1.0,
      repeat: 3,
      callback: () => this.activeStar(this.starList),
    });

    /*
     * 敵役の登場
     */
    this.bombs = this.physics.add.group();

    /*
     * スコアの追加
     */
    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      color: "#000",
    });

    /*
     * 衝突判定
     */
    // 2物体の衝突をテストし、分離させる
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);

    // 2物体の重なり判定時に関数を呼び出す
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      null,
      this
    );
  }

  update(): void {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  activeStar(starList: DynamicBody[]): void {
    // 右端か左端から登場させる
    const leftOrRight = Phaser.Math.Between(0, 1)
      ? 0
      : Number(this.game.config.width);

    let count = 0;
    starList.forEach((star) => {
      if (!star.active && count === 0) {
        star.enableBody(true, leftOrRight, 0, true, true);
        star.setCollideWorldBounds(true);
        star.setBounce(1, 1);
        star.setVelocity(Phaser.Math.Between(-200, 200), 20);
        count++;
      }
    });
  }

  // 星を取得すると、星が消え得点が入る
  collectStar(player: Player, star: DynamicBody) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    const delay = Phaser.Math.Between(3000, 5000);

    this.time.addEvent({
      delay,
      timeScale: 1.0,
      callback: () => this.activeStar(this.starList),
    });

    // 30点ごとに敵を1体追加
    if (this.score % 30 === 0) {
      this.time.addEvent({
        delay,
        timeScale: 1.0,
        callback: () => this.createBomb(player, this.bombs),
      });
    }
  }

  createBomb(player: Player, bombs: DynamicGroup) {
    const x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    const bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }

  // 爆弾に当たるとキャラクターが光り、ゲームオーバーとなる
  hitBomb(player: Player) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    this.gameOver = true;
  }
}
