'use client';
import { useState } from 'react';
import Link from 'next/link';

interface VideoData {
  title: string;
  originalThumbnail: string;
}

interface ThumbOption {
  id: string;
  label: string;
  desc: string;
  url: string;
}

export default function ThumbnailDownloader() {
  const [url, setUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const [thumbOptions, setThumbOptions] = useState<ThumbOption[]>([]);
  const [selectedThumb, setSelectedThumb] = useState<string>('');

  const checkVideo = async () => {
    if (!url) return alert('กรุณาวางลิงก์ก่อนครับ');
    setLoading(true);
    setStatus('⏳ กำลังดึงรูปหน้าปก...');
    setVideoData(null);

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (data.error) {
        setStatus(data.error);
      } else {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const vId = match ? match[1] : null;
        setVideoId(vId);
        setVideoData({ title: data.title, originalThumbnail: data.thumbnail });

        // 🎯 ดึงมาให้ครบทั้ง 5 ขนาดที่ YouTube มีให้! พร้อมบอกตัวเลขพิกเซล
        if (vId) {
          const options = [
            { id: 'maxres', label: '1280 x 720', desc: 'ชัดสูงสุด (FHD)', url: `https://i.ytimg.com/vi/${vId}/maxresdefault.jpg` },
            { id: 'sd', label: '640 x 480', desc: 'มาตรฐาน (SD)', url: `https://i.ytimg.com/vi/${vId}/sddefault.jpg` },
            { id: 'hq', label: '480 x 360', desc: 'คุณภาพสูง (HQ)', url: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg` },
            { id: 'mq', label: '320 x 180', desc: 'คุณภาพกลาง (MQ)', url: `https://i.ytimg.com/vi/${vId}/mqdefault.jpg` },
            { id: 'default', label: '120 x 90', desc: 'ขนาดเล็กสุด', url: `https://i.ytimg.com/vi/${vId}/default.jpg` },
          ];
          setThumbOptions(options);
          setSelectedThumb(options[0].url); // เลือก 1080p เป็นค่าเริ่มต้น
        } else {
          setThumbOptions([{ id: 'default', label: 'Original', desc: 'รูปดั้งเดิม', url: data.thumbnail }]);
          setSelectedThumb(data.thumbnail);
        }

        setStatus('✅ ดึงรูปสำเร็จ! เลือกขนาดที่ต้องการแล้วกดดาวน์โหลดได้เลย');
      }
    } catch (err) {
      setStatus('❌ การเชื่อมต่อมีปัญหา');
    }
    setLoading(false);
  };

  const downloadImage = () => {
    if (!videoData || !selectedThumb) return;
    setStatus('⏳ กำลังเซฟรูปภาพ...');
    const link = `/api/download-thumb?url=${encodeURIComponent(selectedThumb)}&title=${encodeURIComponent(videoData.title)}`;
    window.location.href = link;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 md:p-10 font-sans">
      
      <div className="w-full max-w-4xl flex justify-center gap-4 mb-8">
        <Link href="/" className="px-6 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition shadow-md font-semibold">
          🎬 โหลดวิดีโอ & เสียง
        </Link>
        <Link href="/thumbnail" className="px-6 py-2 rounded-full bg-red-600 text-white shadow-md font-bold ring-2 ring-red-400">
          🖼️ โหลดหน้าปก (Thumbnail)
        </Link>
      </div>

      <div className="bg-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-700">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-white tracking-tight">
          🖼️ <span className="text-red-500">Thumbnail</span> Downloader
        </h2>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="วางลิงก์ YouTube ที่นี่..."
            className="grow p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400 text-lg"
          />
          <button
            onClick={checkVideo}
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl transition duration-150 disabled:bg-gray-600 shrink-0 text-lg shadow-lg active:scale-95"
          >
            {loading ? 'กำลังดึงรูป...' : '🔍 ค้นหารูปปก'}
          </button>
        </div>

        {status && (
          <p className="text-center mb-6 font-semibold text-red-400">{status}</p>
        )}

        {videoData && selectedThumb && (
          <div className="mt-6 flex flex-col items-center animate-fade-in">
            <h3 className="text-xl font-bold text-gray-200 mb-6 text-center">{videoData.title}</h3>
            
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700 mb-8 w-full max-w-3xl bg-gray-900 min-h-50 flex items-center justify-center">
              <img 
                src={selectedThumb} 
                alt="YouTube Thumbnail" 
                className="w-full h-auto object-cover" 
                onError={() => {
                  // ถ้ารูป 1080p โหลดไม่ขึ้น สลับไปใช้ 480x360 อัตโนมัติ
                  if (selectedThumb.includes('maxresdefault') && videoId) {
                    setSelectedThumb(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
                    setStatus('⚠️ รูป 1920x1080 ไม่มีในระบบ สลับเป็นขนาดรองลงมาอัตโนมัติ');
                  }
                }}
              />
              
              <div className="absolute inset-0 hover:bg-black/40 transition duration-300 flex items-center justify-center">
                 <button 
                    onClick={downloadImage}
                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-extrabold py-3 px-8 rounded-full shadow-2xl hover:bg-red-50 hover:text-red-600 hover:scale-105"
                 >
                    ⬇️ ดาวน์โหลดภาพนี้
                 </button>
              </div>
            </div>

            <div className="w-full max-w-3xl mb-8">
              <p className="text-sm text-gray-400 mb-3 font-semibold text-center">เลือกขนาดพิกเซลที่ต้องการดาวน์โหลด:</p>
              
              {/* 🎯 ปรับ Grid ให้รองรับ 5 ปุ่มสวยๆ (แถวบน 3 แถวล่าง 2) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {thumbOptions.map((option) => {
                  const isChecked = selectedThumb === option.url;
                  return (
                    <label key={option.id} className="relative cursor-pointer">
                      <input 
                        type="radio" 
                        name="thumbQuality" 
                        value={option.url} 
                        checked={isChecked} 
                        onChange={(e) => {
                           setSelectedThumb(e.target.value);
                           setStatus('✅ เลือกขนาดแล้ว กดดาวน์โหลดได้เลย');
                        }} 
                        className="sr-only" 
                      />
                      <div className={`group w-full p-4 text-center border-2 rounded-xl transition-all duration-150 shadow-sm active:scale-95 flex flex-col justify-center min-h-22.5 ${
                        isChecked
                          ? 'bg-gray-100 border-white shadow-lg hover:bg-gray-200 hover:border-blue-500 '
                          : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                      }`}>
                        <span className={`text-lg font-bold block transition-colors duration-200 ${isChecked ? 'text-gray-800' : 'text-gray-200 group-hover:text-white'}`}>
                          {option.label}
                        </span>
                        <span className={`block text-xs mt-1 transition-colors duration-200 ${isChecked ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-300'}`}>
                          {option.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              onClick={downloadImage}
              className="w-full max-w-md bg-gray-100 hover:bg-white text-gray-900 font-extrabold py-4 rounded-xl transition duration-150 text-lg shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              ⬇️ บันทึกรูปภาพลงเครื่อง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}