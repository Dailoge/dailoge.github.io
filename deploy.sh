#!/usr/bin/env sh
# shell实现部署 体验更好

# 确保脚本抛出遇到的错误
set -e

# 获取服务器的CNAME，可以从浏览器中copy curl链接
CNAME=`curl 'https://raw.githubusercontent.com/Dailoge/dailoge.github.io/master/CNAME' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36' -H 'Sec-Fetch-Dest: document' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-User: ?1' -H 'Accept-Language: zh-CN,zh;q=0.9' --compressed`
echo -e "\033[40;32m CNAME: ${CNAME} \033[0m"
echo $CNAME > CNAME
# 生成静态文件
npm run build

# 拷贝CNAME文件
cp CNAME dist/CNAME

# 进入生成的文件夹
cd dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:Dailoge/dailoge.github.io.git master

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -