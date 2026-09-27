@echo off
rem Dois cliques e o bot liga. Na primeira vez instala o que falta e pergunta token e webhook.
cd /d "%~dp0"
if not exist node_modules call npm install
call npm start
pause
