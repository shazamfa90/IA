@echo off
rem Dois cliques e o bot liga. Instala o que faltar e, na primeira vez, pergunta token e webhook.
cd /d "%~dp0"
call npm install --no-audit --no-fund
call npm start
pause
