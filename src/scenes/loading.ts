

import Phaser from 'phaser';
const CDN = 'https://storage.360buyimg.com/web-static/hexigua'

/**
 * loading 资源加载页面
 */
export default class LoadingScene extends Phaser.Scene {
  asset: Record<string, Object> = {};
  key = 'loading';
  constructor() {
    super('loading');
  }

  preload() {
    this.load.image('ground', CDN + '/ground.png')
    this.load.image('endLine', CDN + '/endLine.png')
    this.load.image('light', CDN + '/endLine.png')
    this.load.image('gameOver', CDN + '/gameover.png')
    this.load.image("tryagain", CDN + "/tryagain.png");
    this.load.image("yes", CDN + "/yes.png");
    this.load.image("no", CDN + "/no.png");
    for (let i = 1; i <= 11; i++) {
      this.load.image(`${i}`, `${CDN}/${i}.png`)
    }
    this.load.atlas('success', CDN + '/confi.png', CDN + '/confi.json');
    const percentText = this.make
      .text({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 5,
        text: '0%',
        style: {
          font: '28px monospace',
          color: 'red'
        }
      })
      .setOrigin(0.5, 0.5);

    this.load.on('progress', function (value: number) {
      console.log(value)
      percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('complete', function () {
      percentText.destroy();
    });
  }
  create() {
    this.scene.start('Hexigua');
  }
}