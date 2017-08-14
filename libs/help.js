/**
 * 显示帮助
 */

const help = require('u-help')
const pkg = require('../package.json')

function main () {
  help.show('xtzx v' + pkg.version, {
    '命令': {
      upload: '上传文件到storage',
      base64: 'base64图片'
    }
  })
}

module.exports = {
  run: main
}
