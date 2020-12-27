    const config = {
        type: Phaser.AUTO, // Phaser.CANVAS、Phaser.WEBGL、Phaser.AUTO
        width: 800,
        height: 600,
        // アーケード物理システムを利用することを示す
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);
    let platforms;
    let player;
    let stars;
    let bombs;
    let cursors;
    let score = 0;
    let timeCounter = 0;
    let gameOver = false;
    let scoreText;
    let timerEvent;
    const starsList = [];

    // アセットの取得
    function preload ()
    {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        // スプライトシート。1コマごとのキャラクターの動き画像
        // 領域外にある場合は、「画面外」になるため、視覚的には表示されませんが、シーン内には引き続き存在します。
        this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    }
    // 取得したアセットの表示。左上が画像の中心点となる時を0, 0とする。
    function create ()
    {
        this.add.image(400, 300, 'sky');
        //アーケード物理システムの利用。configに追加する必要がある。
        /* アーケード物理学には動的と静的の2種類のボディがある
        * 動的ボディ:
        * 速度や加速度などを介して動き回ることのできるボディ
        * 他の物体と衝突し自身や他要素に影響を与える
        * 
        * 静的ボディ: 
        * 位置とサイズを保持し、重力や速度は持たない。
        * 衝突による影響などもない。
        */

        /*
        * プラットフォームの作成
        */
        platforms = this.physics.add.staticGroup();

        // 画像をスケールした際はrefreshBody()を呼ぶ必要がある。
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        /*
        * プレイヤーの設置
        */
        player = this.physics.add.sprite(100, 450, 'dude');
        // バウンド値の設定
        player.setBounce(0.2);
        // このインスタンスが世界(Canvas領域)に対し衝突判定を持つかどうか
        player.setCollideWorldBounds(true);

        /*
        * プレイヤーの動き
        */
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // キーボードマネージャーを利用するための宣言
        cursors = this.input.keyboard.createCursorKeys();

        /*
        * function create(x, y, frame, visible, active)
        */

        // 星の設置
        stars = this.physics.add.group();
        timerEvent = this.time.addEvent({
            delay: 5000,
            timeScale: 1.0,
            repeat: 3,
            callback: createStar
        });

        /*
        * 敵役の登場
        */
        bombs = this.physics.add.group();

        /*
        * スコアの追加
        */
        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        /*
        * 衝突判定
        */
        // 2物体の衝突をテストし、分離させる
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);

        // 2物体の重なり判定時に関数を呼び出す
        this.physics.add.overlap(player, stars, collectStar, null, this);
        this.physics.add.collider(player, bombs, hitBomb, null, this);
    }

    function update ()
    {
        // console.log(Phaser.Math.Between(0,1));

        // console.log(timerEvent.getElapsedSeconds());
        if (cursors.left.isDown)
        {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
    }

    function createStar () {
        // 右端か左端から登場させる
        const leftOrRight = Phaser.Math.Between(0,1) ? 0 : game.config.width;
        const star = stars.create(leftOrRight, 0, 'star');
        // 星のそれぞれにランダムなバランス値を与える
        star.setCollideWorldBounds(true);
        star.setBounce(1);
        star.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }

    // 星を取得すると、星が消え得点が入る
    function collectStar (player, star)
    {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText('Score: ' + score);

        if (stars.countActive(true) === 9)
        {
            // 再度星を生成する
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            let bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    // 爆弾に当たるとキャラクターが光り、ゲームオーバーとなる
    function hitBomb (player, bomb)
    {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        gameOver = true;
    }