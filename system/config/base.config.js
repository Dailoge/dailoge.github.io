var package = require('../../package.json')
var path = require('path');


var devPort = '2323'
let cdn = ''

if(process.env.NODE_ENV == 'beta'){
    cdn = '/dist/'  
    /*最后应用于output.publicPath，理论上跟环境没有关系，但是在beta环境是不会生成单独的css文件的(因为没使用ExtractTextPlugin插件)，
     直接把样式插入到文件中，所以这时候的图片前缀要加dist；但在product环境下会生成css文件，且也是在dist目录下，
     和图片同级，所以output.publicPath应为空；
    */
}

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
    cdn,
}