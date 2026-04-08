import { NextRequest, NextResponse } from 'next/server';
import { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

// @ts-ignore
const toWebStream = (nodeStream: any) => Readable.toWeb(nodeStream);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const format = searchParams.get('format') || 'video';
    const quality = searchParams.get('quality');
    const audioQuality = searchParams.get('audioQuality') || '320K'; // 👈 รับค่าคุณภาพเสียง (ค่าเริ่มต้น 320K)
    const embedCover = searchParams.get('cover') === 'true';
    const rawTitle = searchParams.get('title') || 'youtube_media';

    let safeTitle = rawTitle.replace(/[\\/:*?"<>|]/g, '').trim() || 'youtube_media';

    const ytdlpPath = path.join(process.cwd(), 'yt-dlp.exe');
    const ffmpegLocalPath = path.join(process.cwd(), 'ffmpeg.exe');

    if (!fs.existsSync(ytdlpPath) || !fs.existsSync(ffmpegLocalPath)) {
        return new NextResponse('Missing yt-dlp.exe or ffmpeg.exe at project root', { status: 500 });
    }

    const youtubedl = create(ytdlpPath);

    try {
        const tempFileName = `temp_${Date.now()}`;
        const extension = format === 'mp3' ? 'mp3' : 'mp4';
        const tempFilePath = path.join(process.cwd(), `${tempFileName}.${extension}`);
        
        // 👈 ตั้งชื่อไฟล์ MP3 ให้มีขนาด kbps บอกไว้ด้วย (เช่น Song_320kbps.mp3)
        let filename = format === 'mp3' 
            ? `${safeTitle}_${audioQuality.replace('K', 'kbps')}.mp3` 
            : `${safeTitle}_${quality}p.mp4`;

        let dlOptions: any = { ffmpegLocation: ffmpegLocalPath, noWarnings: true };

        if (format === 'mp3') {
            dlOptions = { 
                ...dlOptions, 
                x: true, 
                audioFormat: 'mp3', 
                audioQuality: audioQuality, // 👈 สั่ง yt-dlp และ FFmpeg ให้แปลงตามค่าที่คุณเลือก
                o: tempFilePath 
            };
            if (embedCover) dlOptions.embedThumbnail = true;
        } else {
            dlOptions = {
                ...dlOptions,
                f: `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${quality}]+bestaudio/best`,
                mergeOutputFormat: 'mp4', 
                o: tempFilePath
            };
        }

        await youtubedl(videoUrl as string, dlOptions);

        if (!fs.existsSync(tempFilePath)) throw new Error('File not generated');

        const fileStream = fs.createReadStream(tempFilePath);
        fileStream.on('close', () => { if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath); });

        const webStream = toWebStream(fileStream);

        return new NextResponse(webStream as any, {
            headers: {
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                'Content-Type': 'application/octet-stream',
            }
        });
    } catch (error: any) {
        console.error(error.message);
        return new NextResponse('Error downloading', { status: 500 });
    }
}