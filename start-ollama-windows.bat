@echo off
REM Ollama を 12000 番ポートで起動し、llama3.1:8b を取得します
set OLLAMA_HOST=0.0.0.0:12000
start "Ollama (port 12000)" cmd /k ollama serve
timeout /t 4 >nul
set OLLAMA_HOST=127.0.0.1:12000
ollama pull llama3.1:8b
echo Ollama ready at http://localhost:12000/v1  (model: llama3.1:8b)
pause
