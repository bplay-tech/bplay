Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d D:\Bplay\next && npm run dev -- -p 3001 > dev-output4.txt 2>&1", 0, False
