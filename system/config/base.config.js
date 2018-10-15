var package = require('../../package.json')
var path = require('path');


var devPort = '2323'

module.exports = {
    //静态页存储目录
    html: "./src/view",
    //本地调试端口
    devPort: devPort,
    //调试默认打开的页面
    defaultStartPage: '/index.html',
    //web or app
    projectType: 'app',
    //生成目录
    "output": path.join(process.cwd(),'dist'),
    root: 'src/view/pages',
}