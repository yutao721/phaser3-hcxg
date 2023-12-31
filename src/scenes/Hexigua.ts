// @ts-nocheck
import Phaser from 'phaser';

const WINDOW_WIDTH = window.innerWidth
const WINDOW_HEIGHT = window.innerHeight
const SCALE = 0.5
const Ratio = window.devicePixelRatio
const endLineY = 40 * Ratio
const isOffLine = true
const MAX_SCORE = 0

export default class Hexigua extends Phaser.Scene {
  private enableAdd: boolean = true
  private score: number = 0
  private randomLevel: number = 5
  private scoreText;
  private gameModal: any = new Map()
  private particles: any;
  constructor() {
    super('Hexigua')
  }


  create() {

    //设置边界
    this.matter.world.setBounds()

    //添加地面
    const groundSprite = this.add.tileSprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 5 * Ratio, WINDOW_WIDTH, 127, 'ground')
    this.matter.add.gameObject(groundSprite, { isStatic: true, })

    //得分
    this.scoreText = this.add.text(30, 20, `${this.score}`, { font: '45px Arial Black', color: '#ffe325' }).setStroke('#974c1e', 8);

    //初始化一个水果
    const x = WINDOW_WIDTH / 2
    const y = WINDOW_HEIGHT / 10
    let fruit = this.createFruite(x, y);
    console.log(fruit)

    //线创建在水果200px下的位置
    const endLineSprite = this.add.tileSprite(WINDOW_WIDTH / 2, y + 500, WINDOW_WIDTH, 8, 'endLine')
    endLineSprite.setScale(1, SCALE)
    endLineSprite.setAlpha(0)
    //设置物理效果
    this.matter.add.gameObject(endLineSprite, {
      // 静止
      isStatic: true,
      // 传感器模式，可以检测到碰撞，但是不会对物体产品效果
      isSensor: true,
      //物体碰撞回调,

      onCollideActiveCallback: (e, body) => {
        if (this.enableAdd) {
          if (e.bodyB.velocity.y < 1 && e.bodyA.velocity.y < 1) {
            // 游戏结束
            this.events.emit('endGame')
          }
        }
      },
    })

    // 游戏结束
    this.events.once('endGame', () => {
      this.input.off('pointerdown')
      this.tweens.add({
        targets: endLineSprite,
        alpha: 1,
        repeat: 3,
        duration: 300,
        onComplete: () => {
          this.gameModal.get('endModal').setVisible(true)
        }
      })
    })

    // 游戏成功
    this.events.on('success', () => {
      this.createParticles()
    })

    // 测试，自动往下掉
    if (isOffLine) {

    }


    //击屏幕的时候水果往下掉，并生成一个新的水果，新水果生成的时间点就设在落下后一秒钟
    this.input.on('pointerdown', (point: Phaser.Types.Math.Vector2Like) => {
      if (this.enableAdd) {
        this.enableAdd = false
        //先x轴上移动到手指按下的点
        this.tweens.add({
          targets: fruit,
          x: point.x,
          duration: 100,
          ease: 'Power1',
          onComplete: () => {
            fruit.setAwake()
            // 取消静止状态，让物体掉落
            fruit.setStatic(false)

            // 添加粒子跟随
            const particles = this.add.particles(0, 0, 'success', {
              x: { min: 0, max: WINDOW_WIDTH },
              speed: { min: 250, max: 300 },
              bounce: 1,
              gravityY: 400,
              lifespan: 4000,
              quantity: 2,
              y: WINDOW_HEIGHT / 4,
              maxParticles: 100,
              angle: { min: 220, max: 320 },
              scale: { start: 0.5, end: 0 }
            });
            console.log(particles)
            particles.startFollow(fruit);


            // 1s后生成新的水果
            setTimeout(() => {
              fruit = this.createFruite(x, y)
              this.enableAdd = true
            }, 1000);
          }
        })
      }
    })

    // this.matter.world.on()

    const onCollisionStart = (event: any) => {
      const paris = event.source.pairs.list
      paris.forEach((pair: any) => {
        const { bodyA, bodyB } = pair
        const same = bodyA.label === bodyB.label && bodyA.label !== '11' //相同水果 非大西瓜
        const live = !bodyA.isStatic && !bodyB.isStatic //非静态
        if (same && live) {

          if (bodyA.label === '10' || this.score >= MAX_SCORE) {
            this.events.emit('success')
          }

          //设置为Static,这样可以调整物体位置，使物体重合
          bodyA.isStatic = true
          bodyB.isStatic = true
          const { x, y } = bodyA.position || { x: 0, y: 0 }
          //添加两个动画合并的动画
          this.tweens.add({
            targets: bodyB.position,
            props: {
              x: { value: x, ease: 'Power3' },
              y: { value: y, ease: 'Power3' }
            },
            duration: 150,
            onComplete: () => this.onCompose(bodyA, bodyB)
          })

        }
      })
    }
    //碰撞事件
    this.matter.world.on('collisionstart', onCollisionStart)
    this.createEndModal()
  }

  createEndModal() {
    const modalContainer = this.creatMask()
    const centerX = WINDOW_WIDTH / 2

    const gameOver = this.add.sprite(centerX, 100, 'gameOver')
    const tryAgain = this.add.sprite(centerX, 200, 'tryagain')
    const yes = this.add.sprite(centerX - 50, 400, 'yes')
    const no = this.add.sprite(centerX + 50, 400, 'no')
    gameOver.setScale(0.5)
    tryAgain.setScale(0.5)
    yes.setScale(0.5)
    yes.setInteractive()
    yes.on('pointerdown', () => {
      this.restart()
    })
    no.setScale(0.5)
    modalContainer.add([gameOver, tryAgain, yes, no])
    modalContainer.setVisible(false)
    modalContainer.setDepth(11)
    this.gameModal.set('endModal', modalContainer)
  }

  creatMask() {
    const mask = this.add.graphics()
    mask.fillStyle(0X000000, 0.7)
    mask.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
    return this.add.container(0, 0, [mask])
  }

  restart() {
    this.scene.restart()
    this.score = 0;
    this.randomLevel = 5
  }

  createParticles() {
    const frame = ['c1.png', 'c2.png', 'c3.png', 'c4.png', 'c5.png', 'c6.png', 'c7.png', 'c8.png']
    const config = {
      frame: frame,
      x: { min: 0, max: WINDOW_WIDTH },
      speed: { min: 250, max: 300 },
      gravityY: 400,
      lifespan: 4000,
      quantity: 2,
      y: WINDOW_HEIGHT / 4,
      maxParticles: 100,
      angle: { min: 220, max: 320 },
      scale: { start: 0.5, end: 0.8 },

    }
    this.particles = this.add.particles(0, 0, 'success', config)
  }



  onCompose(bodyA, bodyB) {
    const { x, y } = bodyA.position
    const score = parseInt(bodyA.label)
    const lable = score + 1
    //这里合成后，直接消失，有时间的话可以加一些帧动画之类的
    bodyA.gameObject.alpha = 0
    bodyB.gameObject.alpha = 0
    bodyB.destroy()
    bodyA.destroy()
    // 合成水果
    this.createFruite(x, y, false, `${lable}`)

    //得分
    this.score += score
    if (score === 10) {
      this.score += 100
    }
    //根据分数增加初始掉落水果等级
    const add = Math.floor(this.score / 100)
    if (add < 4) {
      this.randomLevel = 5 + add
    }
    this.scoreText.setText(this.score)

  }

  /**
   * 添加一个瓜
   * @param x 坐标x
   * @param y 坐标y
   * @param isStatic 是否静止
   * @param key 瓜的类型
   */
  createFruite(x: number, y: number, isStatic = true, key?: string) {
    if (!key) {
      //顶部落下的瓜前5个随机
      key = `${Phaser.Math.Between(1, this.randomLevel)}`
    }
    const fruit = this.matter.add.image(x, y, key)
    fruit.setBody(
      {
        type: 'circle',
        radius: (fruit.width / 2)
      },
      {
        label: key,
        restitution: 0.3,
        friction: 0.1,
      })
    fruit.setScale(SCALE)
    // 速度
    fruit.setVelocity(100, 200);
    fruit.setBounce(0.5);
    fruit.setStatic(isStatic)
    fruit.setSleepEvents(true, true);
    

    //添加动画
    this.tweens.add({
      targets: fruit,
      scale: SCALE,
      ease: 'Back',
      easeParams: [3.5],
      duration: 200
    })
    return fruit
  }
}