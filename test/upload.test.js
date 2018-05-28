const exec = require('child_process').exec
const assert = require('assert')
const fs = require('fs-extra')
const hashOutput = 'http://storage.xuetangx.com/public_assets/xuetangx/xtzx-test/a027704eca42e8e071fa971b8c8f85f5.xtzx-test.js'
const noHashOutput = 'http://storage.xuetangx.com/public_assets/xuetangx/xtzx-test/xtzx-test.js'

describe('Upload test', function() {
  describe('Without --no-md5 param', function() {
    it('should output hash filename', function(done) {
      exec(
        './bin/xtzx upload ./test/xtzx-test.js xtzx-test',
        (err, stdout, stderr) => {
          if(err) {
            done(err)
          } else {
            assert.notEqual(stdout.indexOf(hashOutput), -1)
            done()
          }
        }
      )
    })
    it('should output upload.log', function(done) {
      exec(
        './bin/xtzx upload ./test/xtzx-test.js xtzx-test --out=./test/upload.log',
        (err, stdout, stderr) => {
          if(err) {
            done(err)
          } else {
            const content = fs.readFileSync('./test/upload.log').toString()
            assert.notEqual(content.indexOf(hashOutput), -1)
            done()
          }
        }
      )
    })
    it('should output test.log', function(done) {
      exec(
        './bin/xtzx upload ./test/xtzx-test.js xtzx-test --out=./test/test.log',
        (err, stdout, stderr) => {
          if(err) {
            done(err)
          } else {
            const content = fs.readFileSync('./test/test.log').toString()
            assert.notEqual(content.indexOf(hashOutput), -1)
            done()
          }
        }
      )
    })

  })
  describe('With --no-md5 param', function() {
    it('should output no hash filename', function(done) {
      exec(
        './bin/xtzx upload ./test/xtzx-test.js xtzx-test --no-md5',
        (err, stdout, stderr) => {
          if(err) {
            done(err)
          } else {
            assert.notEqual(stdout.indexOf(noHashOutput), -1)
            done()
          }
        }
      )
    })
    it('should output upload.log', function(done) {
      exec(
        './bin/xtzx upload ./test/xtzx-test.js xtzx-test --no-md5 --out=./test/upload.log',
        (err, stdout, stderr) => {
          if(err) {
            done(err)
          } else {
            const content = fs.readFileSync('./test/upload.log').toString()
            assert.notEqual(content.indexOf(noHashOutput), -1)
            done()
          }
        }
      )
    })
    it('should output test.log', function(done) {
      exec(
        './bin/xtzx upload ./test/xtzx-test.js xtzx-test --no-md5 --out=./test/test.log',
        (err, stdout, stderr) => {
          if(err) {
            done(err)
          } else {
            const content = fs.readFileSync('./test/test.log').toString()
            assert.notEqual(content.indexOf(noHashOutput), -1)
            done()
          }
        }
      )
    })
  })
})
