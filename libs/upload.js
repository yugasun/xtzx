/**
 * 上传文件到storage
 * @augments --no-md5 不加MD5时间戳
 */
const canUploadType = ['.js', '.css', '.jpg', '.png', '.gif']

const util = require('../util')
const path = require('path')
const fs = require('fs-extra')
const nfs = require('fs')
const glob = require('glob')
const md5 = require('blueimp-md5')
const chalk = require('chalk')
const formstream = require('formstream')
const urllib = require('urllib')
const form = formstream()
const config = util.getConfig()
const args = util.args()

/**
 * 上传主函数
 */
function upload () {
  let filePath
  if (args.param.length && fs.existsSync(args.param[0])) {
    filePath = args.param[0]

    nfs.stat(filePath, function (err, stats) {
      if (err) {
        console.log(chalk.red(err))
        return
      }
      if (stats.isDirectory()) {
        uploadDirFiles(filePath)
      }
      if (stats.isFile()) {
        uploadFile(filePath)
      }
    })
  } else {
    console.log(chalk.red('[error]缺少参数或文件不存在'))
  }
}

/**
 * 批量上传文件夹文件
 *
 * @param {any} dirPath
 */
function uploadDirFiles (dirPath) {
  glob(`${dirPath}/**/*`, {
    realpath: true
  }, function (err, files) {
    if (err) {
      console.log(err)
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
function uploadFile (filePath) {
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

  form.file('file', filePath)
  urllib.request(config.storage + pathObj.base, {
    method: 'post',
    headers: form.headers(),
    stream: form
  }, callback)
}

/**
 * 上传完成回调函数
 * @description 显示上传后的真实路径
 */
function callback (err, data) {
  if (!err) {
    let result = '[ok] ' + JSON.parse(data.toString()).url
    if (~args.ctrl.indexOf('out')) {
      outputFile(result)
    }
    console.log(chalk.green(result))
  } else {
    console.log(chalk.red('[error]请确认已经连接发布环境vpn, 如果已连接请重试。'))
  }
}

/**
 * 输出上传记录到文件中
 *
 * @param {any} content
 */
function outputFile (content) {
  const outPath = 'upload.log'
  console.log(chalk.bgGreen('Writing output file...'))
  if (fs.existsSync(outPath)) {
    let oldContent = fs.readFileSync(outPath).toString()
    content = oldContent + '\n' + content
    fs.writeFile(outPath, content, 'utf8')
  } else {
    fs.writeFile(outPath, content, 'utf8')
  }
}

module.exports = {
  run: upload
}
