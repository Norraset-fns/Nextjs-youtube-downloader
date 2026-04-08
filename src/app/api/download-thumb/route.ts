import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const rawTitle = searchParams.get('title') || 'thumbnail';

    if (!imageUrl) return new NextResponse('Missing URL', { status: 400 });

    // ล้างตัวอักษรพิเศษออกจากชื่อไฟล์
    let safeTitle = rawTitle.replace(/[\\/:*?"<>|]/g, '').trim() || 'thumbnail';

    try {
        // ให้เซิร์ฟเวอร์ของเราไปโหลดรูปจาก YouTube มาก่อน
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error('Failed to fetch image');

        // แปลงเป็นก้อนข้อมูล (Blob)
        const blob = await res.blob();
        
        // ส่งกลับไปให้เบราว์เซอร์พร้อมบังคับหน้าต่างดาวน์โหลดเด้ง
        const headers = new Headers();
        headers.set('Content-Type', res.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitle)}_Cover.jpg"`);

        // @ts-ignore
        return new NextResponse(blob, { headers, status: 200 });
    } catch (error: any) {
        return new NextResponse('Error downloading image', { status: 500 });
    }
}