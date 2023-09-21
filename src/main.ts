import Phaser from 'phaser'

import Hexigua from './scenes/Hexigua'
import loadingScene from './scenes/loading'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#1ac792',
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'app',
  mode: Phaser.Scale.FIT,
  physics: {
    default: 'matter', // 使用matterjs物理引擎
    matter: {
      gravity: {
        y: 2
      },
      debug: false // 开启调试
    }
  },
  scene: [loadingScene, Hexigua],
}

export default new Phaser.Game(config)
