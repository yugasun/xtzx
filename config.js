module.exports = {

    // 通用配置文件
  'configFile': 'config.js',

    // 开发机配置文件
  'devConfig': '.dev',

    // dev开发机用户名
  'user': 'root',

    // storage目录
  'storage': 'http://10.0.0.113/upload/public_assets/xuetangx/',

    // 扩展名文件对应storage默认目录
  'defaultStoragePath': {
    '.png': 'images',
    '.jpg': 'images',
    '.gif': 'images',
    '.jpeg': 'images',
    '.js': 'js',
    '.css': 'style'
  },

    // 图片 mimeType
  'mime': {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'png': 'image/png',
    'svg': 'image/svg-xml'
  }
}
