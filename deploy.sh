#!/bin/bash
set -e
echo "start deploy"
echo "打包"
npm run build
echo "删除备份文件"
ssh root@47.236.143.182 "rm -rf /opt/frondend/app_backup"
echo "创建备份文件夹"
ssh root@47.236.143.182 "mkdir -p /opt/frondend/app_backup"
echo "备份文件"
ssh root@47.236.143.182 "cp -a /opt/frondend/app/* /opt/frondend/app_backup"
echo "创建上传文件夹"
ssh root@47.236.143.182 "mkdir -p /opt/frondend/app_upload"
echo "上传文件"
scp -o ConnectTimeout=60 -l 5000 -r ./dist/* root@47.236.143.182:/opt/frondend/app_upload
echo "删除旧文件"
ssh root@47.236.143.182 "rm -rf /opt/frondend/app"
echo "移动文件"
ssh root@47.236.143.182 "mv /opt/frondend/app_upload /opt/frondend/app"
echo "重启nginx"
ssh root@47.236.143.182 "service nginx restart "
echo "deploy success"
set +e

