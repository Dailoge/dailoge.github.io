#!/usr/bin/env node
// js实现的部署

const axios = require('axios')
const execa = require('execa')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs')

const axiosConfig = {
  timeout: 16000, // Timeout
  withCredentials: true, // Check Cross-Site Access-Control
}
const request = axios.create(axiosConfig)

const spinner = ora()
spinner.start('获取CNAME')
request.get('https://raw.githubusercontent.com/Dailoge/dailoge.github.io/master/CNAME').then(async res => {
  const CNAME = res.data
  fs.writeFileSync('CNAME', CNAME)
  spinner.succeed(chalk.green(CNAME))

  spinner.start('npm run build')
  await execa('npm', ['run', 'build']).then(res => res.stdout).then(stdout => {
    spinner.succeed(chalk.green('打包成功'))
    console.log(stdout)
  })
  fs.copyFileSync('CNAME', 'dist/CNAME')
  // 不能使用cd命令，但可以设置在哪个目录下面执行命令，execa.command是exec执行命令的简写
  // await execa.command('ls -l', { cwd: 'dist' }).then(res => res.stdout).then(console.log)
  await execa.command('git init', { cwd: 'dist' }).then(res => res.stdout).then(stdout => {
    spinner.succeed(chalk.green('初始化仓库成功'))
    console.log(stdout)
  })
  await execa.command('git add -A', { cwd: 'dist' }).then(res => res.stdout).then(console.log)
  await execa.command('git commit -m "deploy"', { cwd: 'dist' }).then(res => res.stdout).then(stdout => {
    spinner.succeed(chalk.green('提交记录成功'))
    console.log(stdout)
  })
  spinner.start('部署中')
  await execa.command('git push -f git@github.com:Dailoge/dailoge.github.io.git master', { cwd: 'dist' }).then(res => res.stdout).then(stdout => {
    spinner.succeed(chalk.green('部署成功'))
    console.log(stdout)
  })
}).catch((err => {
  spinner.fail(chalk.red(err.message))
}))
