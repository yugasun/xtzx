const fs = require('fs-extra')
const path = require('path')
const extend = require('extend')

module.exports = {

  getConfig: function () {
    const config = require('./config')
    let configPath = path.join(process.cwd(), config.configFile)
    let devPath = path.join(process.cwd(), config.devConfig)

    if (fs.existsSync(configPath)) {
      extend(config, require(configPath))
    }

    if (fs.existsSync(devPath)) {
      extend(config, fs.readJsonSync(devPath))
    }

    // root => source
    config.jsRoot = config.jsRoot || config.jsSource
    config.cssRoot = config.cssRoot || config.cssSource

    return config
  },

  /**
   * 格式化参数
   * @param  {Array} args
   * @return {Object} 格式化的参数对象
   */
  args: function () {
    const rtag = /^--/
    let opts = process.argv.slice(3)
    let res = {
      param: [],
      ctrl: [],
      output: ''
    }

    opts.forEach(function (value) {
      if (rtag.test(value)) {
        let ctrl = value.replace(rtag, '')
        if (!~ctrl.indexOf('=')) {
          res.ctrl.push(ctrl)
        } else {
          let arr = ctrl.split('=')
          if (arr[0] === 'out') {
            res.ctrl.push(arr[0])
            res.output = arr[1]
          }
        }
      } else {
        res.param.push(value)
      }
    })

    return res
  },

  /**
   * 是否是二进制内容
   * @param  {String}  content
   * @return {Boolean}
   */
  isBinary: function (content) {
    let encoding = 'utf8'

    // Detect encoding
    for (var i = 0; i < 24; i++) {
      var charCode = content.charCodeAt(i)
      // 65533 is the unknown char
      // 8 and below are control chars (e.g. backspace, null, eof, etc)
      if (charCode === 65533 || charCode <= 8) {
        encoding = 'binary'
        break
      }
    }

    return (encoding === 'binary')
  }
}
