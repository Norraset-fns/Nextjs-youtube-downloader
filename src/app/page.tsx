'use client';
import { useState } from 'react';
import Link from 'next/link';

interface VideoData {
  title: string;
  thumbnail: string;
  duration: string;
  resolutions: { res: number; size: string }[]; 
}

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const [quality, setQuality] = useState<string>('');
  const [audioQuality, setAudioQuality] = useState<string>('320K');
  const [embedCover, setEmbedCover] = useState<boolean>(true);
  
  // 🎯 State สำหรับเช็คว่ากำลังคลิกปุ่มโหลด Video หรือ MP3 (เพื่อทำปุ่มหมุนๆ)
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const checkVideo = async () => {
    if (!url) return alert('กรุณาวางลิงก์ก่อนครับ');
    setLoading(true);
    setStatus('⏳ กำลังดึงข้อมูล...');
    setVideoData(null);
    setQuality('');

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (data.error) {
        setStatus(data.error);
      } else {
        setVideoData(data);
        if (data.resolutions && data.resolutions.length > 0) {
          setQuality(data.resolutions[0].res.toString()); 
        }
        setStatus('✅ ดึงข้อมูลสำเร็จ! เลือกรูปแบบที่ต้องการด้านขวาได้เลย');
      }
    } catch (err) {
      setStatus('❌ การเชื่อมต่อมีปัญหา');
    }
    setLoading(false);
  };

  const downloadFile = (format: string) => {
    if (!videoData) return;

    // 🎯 สั่งให้ปุ่มหมุนติ้วๆ ตาม format ที่กด
    setDownloadingType(format); 
    setStatus('⏳ กำลังประมวลผลไฟล์... (ไฟล์ใหญ่อาจใช้เวลาสักครู่ กรุณารอจนกว่าหน้าต่าง Save จะเด้งขึ้นมาครับ)');

    const title = encodeURIComponent(videoData.title);
    const link = `/api/download?url=${encodeURIComponent(url)}&format=${format}&quality=${quality}&audioQuality=${audioQuality}&cover=${embedCover}&title=${title}`;
    
    // บังคับเบราว์เซอร์ดาวน์โหลดไฟล์
    window.location.href = link;

    // 🎯 ตั้งเวลาปลดล็อกปุ่มให้หยุดหมุนหลังจากผ่านไป 8 วินาที
    setTimeout(() => {
      setDownloadingType(null);
      setStatus('✅ สั่งดาวน์โหลดเรียบร้อย! (ถ้าหน้าต่าง Save ยังไม่ขึ้น แสดงว่าเซิร์ฟเวอร์หลังบ้านกำลังรวมไฟล์อยู่ครับ)');
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-10 font-sans">
      
      {/* 🎯 เมนูนำทาง (Navbar) */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-6">
        <Link href="/" className="px-6 py-2 rounded-full bg-red-600 text-white shadow-md font-bold ring-2 ring-red-400">
          🎬 โหลดวิดีโอ & เสียง
        </Link>
        <Link href="/thumbnail" className="px-6 py-2 rounded-full bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition shadow-sm font-semibold">
          🖼️ โหลดหน้าปก (Thumbnail)
        </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-6xl transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900 tracking-tight">
          📥 <span className="text-red-600">YouTube</span> Downloader Pro
        </h2>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="วางลิงก์ YouTube ที่นี่... (เช่น https://www.youtube.com/watch?v=...)"
            className="grow p-4 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-inner text-lg"
          />
          <button
            onClick={checkVideo}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition duration-150 disabled:bg-gray-400 shrink-0 text-lg shadow-md active:scale-95 flex items-center justify-center min-w-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังโหลด...
              </>
            ) : (
              '🔍 ดูข้อมูลคลิป'
            )}
          </button>
        </div>

        {status && (
          <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r-xl mb-6 shadow-sm" role="alert">
            <p className="font-bold text-center">{status}</p>
          </div>
        )}

        {videoData && (
          <div className="flex flex-col md:flex-row gap-8 mt-8 border-t pt-8 transition-opacity duration-500 ease-in opacity-100">

            <div className="md:w-2/5 shrink-0">
              <div className="sticky top-6">
                <img src={videoData.thumbnail} alt="Cover" className="w-full rounded-2xl shadow-2xl mb-5 aspect-video object-cover border-4 border-white" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{videoData.title}</h3>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-100 p-3 rounded-xl w-fit">
                  <span className="text-xl">⏱</span>
                  <span className="font-semibold text-lg">ความยาว: {videoData.duration}</span>
                </div>
              </div>
            </div>

            <div className="md:w-3/5 flex-col flex gap-6">

              {/* --- โซนวิดีโอ (MP4) --- */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <span className="text-3xl">🎬</span>
                  <h4 className="text-2xl font-bold text-gray-800">ดาวน์โหลดวิดีโอ (MP4)</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3 font-semibold">เลือกระดับความคมชัด:</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {videoData.resolutions.map((item) => {
                    const res = item.res;
                    const size = item.size; 
                    const isChecked = quality === res.toString();
                    
                    return (
                      <label key={res} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="quality"
                          value={res}
                          checked={isChecked}
                          onChange={(e) => setQuality(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`group flex flex-col items-center justify-center w-full p-4 text-center border-2 rounded-xl transition-all duration-150 shadow-sm active:scale-95 ${
                          isChecked 
                            ? 'bg-blue-600 border-blue-600 shadow-lg hover:bg-blue-700 hover:border-blue-700' 
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                        }`}>
                          
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-xl font-bold transition-colors duration-200 ${isChecked ? 'text-white' : 'text-blue-700 group-hover:text-blue-800'}`}>
                              {res}p
                            </span>
                            {res >= 720 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold transition-colors duration-200 ${isChecked ? 'bg-blue-500 text-white group-hover:bg-green-400 group-hover:text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'}`}>HD</span>
                            )}
                            {res < 720 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold transition-colors duration-200 ${isChecked ? 'bg-blue-500 text-white group-hover:bg-green-400 group-hover:text-white' : 'bg-gray-200 text-gray-500 group-hover:bg-blue-200 group-hover:text-blue-700'}`}>SD</span>
                            )}
                          </div>

                          <span className={`text-xs mt-2 font-medium transition-colors duration-200 ${isChecked ? 'text-blue-200' : 'text-gray-500 group-hover:text-blue-600'}`}>
                            {size}
                          </span>
                          
                        </div>
                      </label>
                    );
                  })}
                </div>

                <button
                  onClick={() => downloadFile('video')}
                  disabled={downloadingType === 'video'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl transition duration-150 text-lg shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:bg-blue-400 min-h-15"
                >
                  {downloadingType === 'video' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังประมวลผลวิดีโอ...
                    </>
                  ) : (
                    `⬇️ โหลดวิดีโอ MP4 (${quality}p)`
                  )}
                </button>
              </div>

              {/* --- โซนเสียง (MP3) --- */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <span className="text-3xl">🎵</span>
                  <h4 className="text-2xl font-bold text-gray-800">ดาวน์โหลดเสียง (MP3)</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3 font-semibold">เลือกระดับคุณภาพเสียง:</p>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[{ val: '320K', label: '320 kbps', desc: 'ชัดสุด' }, { val: '192K', label: '192 kbps', desc: 'มาตรฐาน' }, { val: '128K', label: '128 kbps', desc: 'ประหยัดพื้นที่' }].map((item) => {
                    const isAudioChecked = audioQuality === item.val;
                    return (
                      <label key={item.val} className="relative cursor-pointer">
                        <input type="radio" name="audioQuality" value={item.val} checked={isAudioChecked} onChange={(e) => setAudioQuality(e.target.value)} className="sr-only" />
                        <div className={`group w-full p-4 text-center border-2 rounded-xl transition-all duration-150 shadow-sm active:scale-95 ${
                          isAudioChecked
                            ? 'bg-green-600 border-green-600 shadow-lg hover:bg-green-700 hover:border-green-700'
                            : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
                        }`}>
                          <span className={`text-lg font-bold block transition-colors duration-200 ${isAudioChecked ? 'text-white' : 'text-green-700 group-hover:text-green-800'}`}>
                            {item.label}
                          </span>
                          <span className={`block text-xs mt-1 transition-colors duration-200 ${isAudioChecked ? 'text-green-100 group-hover:text-yellow-200' : 'text-gray-400 group-hover:text-green-600'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <label className="cursor-pointer flex items-center gap-3 mb-6 text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
                  <input type="checkbox" checked={embedCover} onChange={(e) => setEmbedCover(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                  <span className="text-base font-semibold">🖼️ ฝังรูปปกคลิปเป็นหน้าปกไฟล์ MP3</span>
                </label>

                <button
                  onClick={() => downloadFile('mp3')}
                  disabled={downloadingType === 'mp3'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 rounded-xl transition duration-150 text-lg shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:bg-green-400 min-h-15"
                >
                  {downloadingType === 'mp3' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังแปลงไฟล์เสียง...
                    </>
                  ) : (
                    `⬇️ โหลดเพลง MP3 (${audioQuality.replace('K', 'kbps')})`
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      <footer className="mt-10 text-center text-gray-500 text-sm">
        Next.js + TypeScript + yt-dlp + FFmpeg | Personal Downloader Tool
      </footer>
    </div>
  );
}