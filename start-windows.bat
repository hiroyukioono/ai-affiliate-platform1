@echo off
REM AI Affiliate Platform - Windows 11 起動スクリプト
cd /d %~dp0
if not exist .env copy .env.example .env
echo [1/3] npm install
call npm install
echo [2/3] DB初期化・初期データ投入
call npm run db:seed
echo [3/3] サーバー起動 http://localhost:3000/admin/
echo (Ollama は別ウィンドウで:  set OLLAMA_HOST=0.0.0.0:12000 ^&^& ollama serve  /  ollama pull llama3.1:8b)
call npm run dev
pause
