@echo off
cd /d "%~dp0"
echo Starting local preview at http://localhost:8080
echo Press Ctrl+C to stop the server.
start http://localhost:8080
python -m http.server 8080
