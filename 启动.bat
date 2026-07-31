@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 前端启动中... http://127.0.0.1:8848
echo 请保持此窗口打开。
if not exist "node_modules" (
  echo 正在安装依赖...
  call npm install
)
call npm run dev
echo 前端已退出。
pause
