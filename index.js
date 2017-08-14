const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

// expose xtx
module.exports = {
  run: run
}

/**
 * xtx命令入口
 * @param  {String} cmd 命令名称
 */
function run (cmd) {
  cmd = cmd.split(':')

  let cmdPath = path.join(__dirname, 'libs', cmd[0] + '.js')
  let cb = 'run'
  let lib

    // 若找不到命令，显示帮助
  if (!fs.existsSync(cmdPath)) {
    cmdPath = path.join(__dirname, 'libs/help.js')
  }

  lib = require(cmdPath)

  if (lib[cb]) {
    lib[cb]()
  } else {
    console.log(chalk.red('没有找到' + cb + '命令!'))
  }
}
