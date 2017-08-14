/**
 * base64图片
 */
const fs = require('fs-extra')
const path = require('path')
const util = require('../util')
const chalk = require('chalk')
const config = util.getConfig()
const args = util.args()

function base64 () {
  const param = args.param
  let res
  let filePath
  let ext

  if (param.length) {
    filePath = param[0]
    if (!fs.existsSync(filePath)) {
      console.log(chalk.red('文件不存在!'))
      return false
    }
    ext = path.parse(filePath).ext.substring(1)
    if (ext in config.mime) {
      res = ['data:', config.mime[ext], ';base64,']
      res.push(fs.readFileSync(filePath, 'base64'))
      console.log(res.join(''))
    } else {
      console.log(chalk.red('不支持的图片格式!'))
    }
  } else {
    console.log(chalk.red('请指定要编码的图片!'))
  }
}

module.exports = {
  run: base64
}
