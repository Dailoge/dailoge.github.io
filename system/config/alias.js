var path = require('path')

module.exports = {
    '@controller':path.join(process.cwd(), 'src', 'controller'),
    '@model':path.join(process.cwd(), 'src','model'),
    '@component':path.join(process.cwd(), 'src','view','components'),
    '@lib':path.join(process.cwd(), 'src','lib'),
    '@mock':path.join(process.cwd(), 'src','mock'),
    '@utils':path.join(process.cwd(), 'src','utils')
}