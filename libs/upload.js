/**
 * 上传文件到storage
 * @augments --no-md5 不加MD5时间戳
 */
const canUploadType = ['.js', '.css', '.jpg', '.png', '.gif', '.json']

const util = require('../util')
const path = require('path')
const fs = require('fs-extra')
const nfs = require('fs')
const glob = require('glob')
const md5 = require('blueimp-md5')
const chalk = require('chalk')
const formstream = require('formstream')
const urllib = require('urllib')
const config = util.getConfig()
const args = util.args()

let currentFile = ''
/**
 * 上传主函数
 */
function upload() {
  let filePath
  if (args.param.length && fs.existsSync(args.param[0])) {
    filePath = args.param[0]

    nfs.stat(filePath, function (err, stats) {
      if (err) {
        console.log(chalk.bgRed.black(' ERROR ') + chalk.red(err))
        return
      }

      console.log(chalk.bgBlue.black(' WAIT ') + chalk.blue(' Uploading ' + '\n'))

      if (stats.isDirectory()) {
        uploadDirFiles(filePath)
      }
      if (stats.isFile()) {
        uploadFile(filePath)
      }
    })
  } else {
    console.log(chalk.bgRed.black(' ERROR ') + chalk.red('缺少参数或文件不存在'))
  }
}

/**
 * 批量上传文件夹文件
 *
 * @param {any} dirPath
 */
function uploadDirFiles(dirPath) {
  glob(`${dirPath}/**/*`, {
    realpath: true
  }, function (err, files) {
    if (err) {
      console.log(chalk.bgRed.black(' ERROR ') + chalk.red(err))
      return
    }
    files.forEach(function (filePath) {
      var pathObj = path.parse(filePath)
      if (canUploadType.indexOf(pathObj.ext) !== -1) {
        uploadFile(filePath)
      }
    })
  })
}

/**
 * 上传单个文件处理函数
 *
 * @param {any} filePath
 */
function uploadFile(filePath) {
  let distPath
  let pathObj
  let content

  distPath = args.param[1]

  pathObj = path.parse(filePath)

  if (!distPath && pathObj.ext in config.defaultStoragePath) {
    distPath = config.defaultStoragePath[pathObj.ext]
  }

  content = fs.readFileSync(filePath).toString()

  // md5
  // 二进制文件每次根据时间戳生成最新md5值,
  // 文本文件根据内容生成md5
  if (!~args.ctrl.indexOf('no-md5')) {
    pathObj.name = md5(util.isBinary(content) ? +new Date() : content) + '.' + pathObj.name
  }

  // 文件名覆盖
  pathObj.base = pathObj.name + pathObj.ext

  // 上传路径覆写
  pathObj.dir = distPath
  let form = formstream()
  form.file('file', filePath)
  urllib.request(config.storage + pathObj.dir + '/' + pathObj.base, {
    method: 'post',
    headers: form.headers(),
    stream: form
  }, function (err, data, res) {
    callback(err, data, res, filePath)
  })
}

/**
 * 上传完成回调函数
 * @description 显示上传后的真实路径
 */
function callback(err, data, res, filePath) {
  if (!err) {
    let time = formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')
    let result = '[' + time + '] ' + JSON.parse(data.toString()).url

    if (!~args.ctrl.indexOf('out')) {
      console.log(chalk.bgGreen.black(' DONE ') + chalk.green(result + '\n'))
    } else {
      outputFile(result, filePath)

    }

  } else {
    console.log(chalk.bgRed.black(' ERROR ') + chalk.red('请确认已经连接发布环境vpn, 如果已连接请重试。'))
  }
}

/**
 * 输出上传记录到文件中
 *
 * @param {any} content
 */
function outputFile(content, filePath) {
  const outPath = args.output || 'upload.log'
  const pathObj = path.parse(outPath)
  if (pathObj.dir) {
    mkdirSync(pathObj.dir)
  }

  if (fs.existsSync(outPath)) {
    let oldContent = fs.readFileSync(outPath).toString()
    content = oldContent + '\n' + content
    fs.writeFile(outPath, content, 'utf8', function () {
      console.log(chalk.bgGreen.black(' DONE ') + chalk.green(' Uploaded ' + filePath + '\n'))
    })
  } else {
    fs.writeFile(outPath, content, 'utf8', function () {
      console.log(chalk.bgGreen.black(' DONE ') + chalk.green(' Uploaded ' + filePath + '\n'))
    })
  }
}

function mkdirSync(url, mode, cb) {
  const arr = url.split('/')
  mode = mode || 0755
  cb = cb || function () { }
  if (arr[0] === '.') {
    arr.shift()
  }
  if (arr[0] === '..') {
    arr.splice(0, 2, arr[0] + '/' + arr[1])
  }

  function inner(cur) {
    if (!fs.existsSync(cur)) {
      fs.mkdirSync(cur, mode)
    }
    if (arr.length) {
      inner(cur + '/' + arr.shift())
    } else {
      cb()
    }
  }
  arr.length && inner(arr.shift())
}

/**
 * 格式化时间格式
 *
 * @param {any} time
 * @param {any} fmt
 * @returns
 */
function formatTime(time, fmt) {
  var obj = {
    'M+': time.getMonth() + 1, // 月
    'd+': time.getDate(), // 日
    'H+': time.getHours(), // 小时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'S': time.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in obj) {
    let reg = new RegExp('(' + k + ')')
    if (reg.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? obj[k] : (('00' + obj[k]).substr(('' + obj[k]).length)))
    }
  }
  return fmt
}

module.exports = {
  run: upload
}
