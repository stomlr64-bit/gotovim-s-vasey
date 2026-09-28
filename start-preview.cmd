@echo off
cd /d "%~dp0"
set "RECIPE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%RECIPE_NODE%" (
  "%RECIPE_NODE%" tools\preview.cjs
) else (
  node tools\preview.cjs
)
pause
