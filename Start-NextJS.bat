@echo off
title Next.js TypeScript Downloader
color 0A

echo ==========================================
echo    Checking for yt-dlp Updates...
echo ==========================================
:: สั่งให้อัปเดตตัวเองอัตโนมัติ เผื่อ YouTube เปลี่ยนระบบ
yt-dlp.exe -U

echo.
echo ==========================================
echo    Starting Next.js Server...
echo ==========================================
echo Opening browser...

:: สั่งเปิดหน้าเว็บรอไว้เลย
start http://localhost:3000

:: รันเซิร์ฟเวอร์ Next.js แบบ Developer Mode
npm run dev

pause