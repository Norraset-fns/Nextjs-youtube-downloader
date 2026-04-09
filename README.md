# 📥 YouTube Downloader

เว็บแอปพลิเคชันสำหรับดาวน์โหลดวิดีโอ, เสียง (MP3), และรูปหน้าปก (Thumbnail) จาก YouTube พัฒนาด้วย Next.js และ Tailwind CSS 

## ✨ ฟีเจอร์หลัก (Features)
- 🎬 **ดาวน์โหลดวิดีโอ (MP4):** เลือกความละเอียดได้ตามต้องการ (พร้อมคำนวณขนาดไฟล์ MB ให้ดูก่อนโหลด)
- 🎵 **ดาวน์โหลดเสียง (MP3):** เลือกคุณภาพเสียงได้ (320kbps, 192kbps, 128kbps) พร้อมฟีเจอร์ฝังรูปหน้าปกคลิปเข้าไปในไฟล์ MP3
- 🖼️ **ดาวน์โหลดหน้าปก (Thumbnail):** ดึงรูปหน้าปกได้ครบทุกขนาด (1080p ไปจนถึงขนาดจิ๋ว) พร้อมระบบ Fallback อัตโนมัติถ้ารูปขนาดใหญ่ไม่มีในระบบ

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend:** Next.js (React), Tailwind CSS v4
- **Backend (API Routes):** Next.js API
- **Core Tools:** 
  - `yt-dlp` (สำหรับดึงข้อมูลและดาวน์โหลดจาก YouTube)
  - `ffmpeg` (สำหรับแปลงไฟล์เสียงและฝังรูปหน้าปก)

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (Getting Started)

เนื่องจากโปรเจกต์นี้มีการใช้ไฟล์ Binary ภายนอกที่ไม่ได้อัปโหลดขึ้น GitHub กรุณาทำตามขั้นตอนด้านล่างเมื่อโคลนโปรเจกต์ไปรันที่เครื่องใหม่:

### 1. สิ่งที่ต้องมีก่อนเริ่ม (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
- **yt-dlp.exe:** [ดาวน์โหลดที่นี่](https://github.com/yt-dlp/yt-dlp/releases) แล้วนำไฟล์ `yt-dlp.exe` มาวางไว้ที่ **โฟลเดอร์นอกสุด (Root directory)** ของโปรเจกต์
- **FFmpeg:** [ดาวน์โหลดที่นี่](https://ffmpeg.org/download.html) และติดตั้งลงเครื่อง (อย่าลืมเซ็ต Environment Variables) เพื่อให้ระบบแปลงไฟล์ MP3 ได้

### 2. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรันคำสั่ง:
```bash
npm install
```

# 📥 YouTube Downloader
A powerful web application for downloading YouTube videos, high-quality audio (MP3), and video thumbnails. Built with Next.js and Tailwind CSS.

## ✨ Features
- 🎬 **Video Download (MP4):** Choose your preferred video resolution. The app automatically calculates and displays the estimated file size (MB) before downloading.
- 🎵 **Audio Download (MP3):** Select from multiple audio quality options (320kbps, 192kbps, 128kbps) with a built-in feature to embed the YouTube thumbnail as the MP3 cover art.
- 🖼️ **Thumbnail Download:** Fetch video covers in all available sizes (from 1080p down to 120p). Includes a robust automatic fallback system if a specific high-res image is unavailable on YouTube's servers.

## 🛠️ Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Next.js API Routes
- **Core Tools:** 
  - `yt-dlp` (For fetching video info and handling downloads)
  - `ffmpeg` (For audio conversion and metadata embedding)

---

## 🚀 Getting Started

Since this project relies on external binaries that are ignored in Git (`.gitignore`), please follow these setup instructions carefully when cloning the repository to a new machine.

### 1. Prerequisites
- **Node.js:** Make sure you have [Node.js](https://nodejs.org/) (Version 18 or higher) installed.
- **yt-dlp:** [Download the latest release](https://github.com/yt-dlp/yt-dlp/releases) and place the `yt-dlp.exe` file directly into the **root directory** of this project.
- **FFmpeg:** [Download FFmpeg](https://ffmpeg.org/download.html), install it on your system, and ensure it is added to your system's Environment Variables (PATH) for the MP3 conversion to work properly.

### 2. Installation
Open your terminal in the project directory and install the dependencies:
```bash
npm install

