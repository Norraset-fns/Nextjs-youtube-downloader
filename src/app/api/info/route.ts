import { NextRequest, NextResponse } from 'next/server';
import { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) return NextResponse.json({ error: '❌ ลิงก์ไม่ถูกต้อง' }, { status: 400 });

    const ytdlpPath = path.join(process.cwd(), 'yt-dlp.exe');
    if (!fs.existsSync(ytdlpPath)) return NextResponse.json({ error: '❌ หาไฟล์ yt-dlp.exe ไม่เจอ' }, { status: 500 });

    const youtubedl = create(ytdlpPath);

    try {
        const info: any = await youtubedl(videoUrl, { 
            dumpJson: true, 
            noWarnings: true, 
            skipDownload: true, 
            noCacheDir: true 
        });

        // 🎯 1. หาขนาดของไฟล์ "เสียงที่ดีที่สุด" เตรียมไว้ก่อน
        const bestAudio = info.formats
            .filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none')
            .sort((a: any, b: any) => (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0))[0];
        const audioSize = bestAudio ? (bestAudio.filesize || bestAudio.filesize_approx || 0) : 0;

        // 🎯 2. หาขนาดของไฟล์ "ภาพ" ในแต่ละความชัด
        const resolutionsMap = new Map<number, number>();
        info.formats.forEach((f: any) => {
            if (f.vcodec !== 'none' && f.height) {
                const size = f.filesize || f.filesize_approx || 0;
                const currentSize = resolutionsMap.get(parseInt(f.height)) || 0;
                // ถ้าเจอขนาดที่ใหญ่กว่าในความชัดเดียวกัน ให้จำค่าที่ใหญ่กว่าไว้
                if (size > currentSize) {
                    resolutionsMap.set(parseInt(f.height), size);
                }
            }
        });

        // 🎯 3. ฟังก์ชันแปลงตัวเลข Bytes ให้เป็น MB แบบสวยๆ
        const formatBytes = (bytes: number) => {
            if (bytes === 0) return 'ไม่ทราบขนาด';
            const mb = bytes / (1024 * 1024);
            return `~${mb.toFixed(1)} MB`; // ใส่ ~ เพื่อบอกว่าเป็นค่าประมาณ
        };

        // 🎯 4. เอาภาพและเสียงมาบวกกัน แล้วจัดเรียง
        const availableResolutions = Array.from(resolutionsMap.entries())
            .map(([height, videoSize]) => ({
                res: height,
                size: formatBytes(videoSize > 0 ? videoSize + audioSize : 0) // บวกภาพและเสียงเข้าด้วยกัน
            }))
            .sort((a, b) => b.res - a.res);

        return NextResponse.json({
            title: info.title, 
            thumbnail: info.thumbnail, 
            duration: info.duration_string, 
            resolutions: availableResolutions // ส่งกลับไปเป็นชุดข้อมูล { res: 1080, size: "~50.2 MB" }
        });
    } catch (error: any) {
        return NextResponse.json({ error: '❌ ดึงข้อมูลไม่สำเร็จ' }, { status: 500 });
    }
}