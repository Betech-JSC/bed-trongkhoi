"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Wedding {
  id: number;
  slug: string;
  template: string;
  groomName: string;
  groomShortName?: string | null;
  groomFather?: string | null;
  groomMother?: string | null;
  groomAddress?: string | null;
  brideName: string;
  brideShortName?: string | null;
  brideFather?: string | null;
  brideMother?: string | null;
  brideAddress?: string | null;
  weddingDate: string;
  ceremonyTitle: string;
  ceremonyTime?: string | null;
  ceremonyLocation?: string | null;
  ceremonyMapIframe?: string | null;
  ceremonyMapLink?: string | null;
  partyTitle: string;
  partyTime?: string | null;
  partyLocation?: string | null;
  partyMapIframe?: string | null;
  partyMapLink?: string | null;
  musicUrl?: string | null;
  albumPhotos: string; // JSON string
  activeSections: string; // JSON string
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolderName?: string | null;
}

interface Props {
  wedding: Wedding;
  guestName: string;
}

// 1. Falling Rose Petals Canvas Effect
function RosePetalsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const petalCount = 12;
    const petals: Array<{
      x: number;
      y: number;
      r: number;
      d: number;
      speed: number;
      oscSpeed: number;
      angle: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 4 + 1,
        d: Math.random() * petalCount,
        speed: Math.random() * 0.8 + 0.4,
        oscSpeed: Math.random() * 0.01 + 0.005,
        angle: Math.random() * 360,
        size: Math.random() * 6 + 4,
        opacity: Math.random() * 0.25 + 0.35
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      petals.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * Math.PI / 180);
        
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(186, 45, 62, ${p.opacity})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.8, p.size * 0.08, 0, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(224, 86, 102, ${p.opacity * 0.5})`;
        ctx.fill();

        ctx.restore();

        p.y += p.speed;
        p.x += Math.sin(p.d) * 0.4;
        p.d += p.oscSpeed;
        p.angle += p.speed * 0.3;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
          p.angle = Math.random() * 360;
          p.speed = Math.random() * 0.8 + 0.4;
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[52] w-full h-full" />;
}

// 2. Scroll Reveal Section Wrapper
function ScrollReveal({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-12'
      }`}
    >
      {children}
    </div>
  );
}

// 2b. Memoized Map Section to prevent iframe reload/flicker on state updates
const MapSection = React.memo(({ iframeHtml }: { iframeHtml: string }) => {
  return (
    <div 
      className="w-full h-64 border border-slate-200 rounded-3xl overflow-hidden shadow-sm [&_iframe]:w-full [&_iframe]:h-full"
      dangerouslySetInnerHTML={{ __html: iframeHtml }}
    />
  );
});
MapSection.displayName = 'MapSection';

export default function InvitationClient({ wedding, guestName }: Props) {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState<string | null>(null);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);
  
  const albumPhotosList: string[] = JSON.parse(wedding.albumPhotos || '[]');
  const activeSectionsMap: Record<string, boolean> = JSON.parse(wedding.activeSections || '{}');
  
  const [selectedAlbumPhotoIdx, setSelectedAlbumPhotoIdx] = useState(0);

  // Auto set selection to first image if photos exist
  useEffect(() => {
    const defaultIdx = albumPhotosList.findIndex(
      p => !p.includes('83/bf/ec') && !p.includes('94/28/c5') && !p.includes('ea/cc/05')
    );
    if (defaultIdx !== -1) {
      setSelectedAlbumPhotoIdx(defaultIdx);
    }
  }, [wedding.albumPhotos]);

  // Responsive scale factor for envelope
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 370) {
        setScale((width - 20) / 350);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  useEffect(() => {
    let targetHour = 0;
    let targetMinute = 0;
    const cleanWeddingDate = wedding.weddingDate.split(/[T ]/)[0];
    const weddingDateParts = cleanWeddingDate.split('-');
    let timeString = wedding.ceremonyTime;
    
    if (weddingDateParts.length === 3) {
      const dayStr = weddingDateParts[2];
      const monthStr = weddingDateParts[1];
      
      if (wedding.partyTime && (wedding.partyTime.includes(`${dayStr}.${monthStr}`) || wedding.partyTime.includes(`${dayStr}/${monthStr}`))) {
        timeString = wedding.partyTime;
      }
    }
    
    if (timeString) {
      const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        targetHour = parseInt(timeMatch[1], 10);
        targetMinute = parseInt(timeMatch[2], 10);
      }
    }
    
    const parseWeddingDate = () => {
      const dateStr = wedding.weddingDate;
      const cleanDateStr = dateStr.split(/[T ]/)[0];
      const parts = cleanDateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, targetHour, targetMinute, 0);
      }
      return new Date(dateStr);
    };

    const targetDate = parseWeddingDate();

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, total: difference });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [wedding.weddingDate, wedding.ceremonyTime]);

  const [rsvpForm, setRsvpForm] = useState({
    guest_name: guestName || '',
    relation: '',
    wishes: '',
    attendance_status: 'attending',
  });

  const [isRelationOpen, setIsRelationOpen] = useState(false);
  const relationRef = useRef<HTMLDivElement | null>(null);

  const relationOptions = [
    { value: 'Bạn Chú Rể', label: 'Bạn Chú Rể' },
    { value: 'Bạn Cô Dâu', label: 'Bạn Cô Dâu' },
    { value: 'Họ Hàng Nhà Trai', label: 'Họ Hàng Nhà Trai' },
    { value: 'Họ Hàng Nhà Gái', label: 'Họ Hàng Nhà Gái' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (relationRef.current && !relationRef.current.contains(event.target as Node)) {
        setIsRelationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dateObj = new Date(wedding.weddingDate);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  const sections = {
    music: true,
    calendar: true,
    maps: true,
    rsvp: true,
    gallery: true,
    gift: true,
    ...activeSectionsMap
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log('Audio playback blocked: ', err));
    }
  };

  const couplePhoto = albumPhotosList.find(
    p => !p.includes('83/bf/ec') && !p.includes('94/28/c5') && !p.includes('ea/cc/05')
  ) || albumPhotosList[0] || '';

  const galleryPhotos = albumPhotosList.filter(
    url => !url.includes('83/bf/ec') && !url.includes('94/28/c5') && !url.includes('ea/cc/05')
  );

  const handleOpenCard = () => {
    if (isOpening) return;
    setIsOpening(true);
    
    if (sections.music && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log('Audio playback blocked initially: ', err));
    }

    setTimeout(() => {
      setIsOpened(true);
    }, 3500);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRsvpSubmitting(true);
    setRsvpMessage(null);
    setRsvpError(null);

    if (!rsvpForm.relation) {
      setRsvpError('Vui lòng chọn mối quan hệ.');
      setIsRsvpSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/rsvp/${encodeURIComponent(wedding.slug)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpForm),
      });
      const data = await res.json();
      if (data.success) {
        setRsvpMessage(data.message);
        setRsvpForm({
          guest_name: guestName || '',
          relation: '',
          wishes: '',
          attendance_status: 'attending',
        });
      } else {
        setRsvpError(data.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setRsvpError('Có lỗi kết nối. Hãy kiểm tra lại mạng.');
    } finally {
      setIsRsvpSubmitting(false);
    }
  };

  const getVietQrLink = () => {
    if (!wedding.bankName || !wedding.bankAccount) return '';
    const bank = encodeURIComponent(wedding.bankName.trim());
    const account = encodeURIComponent(wedding.bankAccount.trim());
    const holder = encodeURIComponent(wedding.bankHolderName || '');
    const message = encodeURIComponent(`Mung cuoi ${wedding.groomShortName || 'Chu Re'} & ${wedding.brideShortName || 'Co Dau'}`);
    return `https://img.vietqr.io/image/${bank}-${account}-compact.jpg?accountName=${holder}&addInfo=${message}`;
  };

  const renderCalendarDays = () => {
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isWeddingDay = d === day;
      days.push(
        <div 
          key={`day-${d}`} 
          className={`h-8 w-8 flex items-center justify-center text-xs font-semibold font-body relative ${
            isWeddingDay ? 'text-white' : 'text-slate-800'
          }`}
        >
          {isWeddingDay && (
            <div className="absolute inset-0 bg-[#7d1f2a] rounded-full scale-110 flex items-center justify-center animate-pulse z-0">
              <span className="sr-only">Wedding Day</span>
            </div>
          )}
          <span className="z-10">{d}</span>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-start font-sans antialiased text-slate-800 selection:bg-[#7d1f2a] selection:text-white">
      
      {/* Dynamic CSS declarations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-title { font-family: 'Cormorant Garamond', serif; }
        .font-script { font-family: 'Alex Brush', cursive; }
        .font-body { font-family: 'Montserrat', sans-serif; }

        .btn-gold-sweep {
          position: relative;
          overflow: hidden;
        }
        .btn-gold-sweep::after {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 239, 204, 0.45),
            transparent
          );
          transform: skewX(-30deg);
          transition: 0s;
        }
        .btn-gold-sweep:hover::after, .btn-gold-sweep:active::after {
          left: 125%;
          transition: 0.85s ease-in-out;
        }

        @keyframes envelope-pulse-wiggle {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.025) rotate(-0.8deg); }
          50% { transform: scale(0.98) rotate(0.8deg); }
          75% { transform: scale(1.025) rotate(-0.8deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-envelope-pulse {
          animation: envelope-pulse-wiggle 4.5s infinite ease-in-out;
        }
      `}} />

      {/* Font loaders via Google Fonts link (Standard fallback mechanism) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />

      {/* Viewport Falling Petals */}
      <RosePetalsCanvas />

      {/* Background Music Player */}
      {sections.music && wedding.musicUrl && (
        <audio
          ref={audioRef}
          src={wedding.musicUrl}
          loop
          preload="auto"
        />
      )}

      {/* Floating Music Controller */}
      {sections.music && wedding.musicUrl && isOpened && (
        <button
          onClick={toggleMusic}
          className="backdrop-blur border border-slate-200 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform btn-gold-sweep"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
          aria-label="Toggle Music"
        >
          {isPlaying ? (
            <div className="flex items-end gap-0.5 justify-center h-5 w-5">
              <span className="w-1 bg-[#7d1f2a] h-3 animate-[bounce_0.8s_infinite]"></span>
              <span className="w-1 bg-[#7d1f2a] h-5 animate-[bounce_0.5s_infinite_delay-200]"></span>
              <span className="w-1 bg-[#7d1f2a] h-2 animate-[bounce_0.6s_infinite_delay-100]"></span>
              <span className="w-1 bg-[#7d1f2a] h-4 animate-[bounce_0.7s_infinite_delay-300]"></span>
            </div>
          ) : (
            <svg className="w-5 h-5 text-[#7d1f2a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      )}

      {/* 1. Envelope overlay panel */}
      {!isOpened && (
        <div className={`fixed inset-0 z-50 bg-[#fefdfb] flex flex-col items-center justify-center overflow-hidden max-w-[480px] mx-auto shadow-2xl transition-opacity duration-700 ${isOpening && isOpened ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          
          <img 
            src="https://content.pancake.vn/web-media/01/01/53/a6/107b40fff2db3985e6374bad6eb40b8bb6dfa91f0baa5d82e0bad933-w:313-h:313-l:8578-t:image/png.png" 
            alt="Border Top Left" 
            className="absolute top-0 left-0 w-[81px] h-[81px] object-contain pointer-events-none z-10"
          />
          <img 
            src="https://content.pancake.vn/web-media/01/01/53/a6/107b40fff2db3985e6374bad6eb40b8bb6dfa91f0baa5d82e0bad933-w:313-h:313-l:8578-t:image/png.png" 
            alt="Border Top Right" 
            className="absolute top-0 right-0 w-[81px] h-[81px] object-contain pointer-events-none z-10 transform scale-x-[-1]"
          />
          <img 
            src="https://content.pancake.vn/web-media/fc/e6/9f/73/869f8d1e41593a31be6fb63256122728f3320233548fdc919694c113-w:500-h:500-l:22615-t:image/png.png" 
            alt="Border Bottom Left" 
            className="absolute bottom-[45px] left-[22px] w-[81px] h-[81px] object-contain pointer-events-none z-10"
          />
          <img 
            src="https://content.pancake.vn/web-media/fc/e6/9f/73/869f8d1e41593a31be6fb63256122728f3320233548fdc919694c113-w:500-h:500-l:22615-t:image/png.png" 
            alt="Border Bottom Right" 
            className="absolute bottom-[45px] right-[22px] w-[81px] h-[81px] object-contain pointer-events-none z-10"
          />

          <div className="text-center mb-1 z-20">
            <p className="font-body text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">THIỆP</p>
            <h2 className="font-script text-5xl text-slate-800 leading-none">Mời Cưới</h2>
            <div className="mt-4 flex justify-center">
              <img 
                src="https://content.pancake.vn/1/fwebp80/e7/f3/2e/9f/c37b6aa27572f1e8e9a939833d77ebe2563ed46102b316d6b293453e-w:313-h:313-l:124683-t:image/png.png" 
                alt="囍" 
                className="h-14 w-14 object-contain opacity-95"
              />
            </div>
          </div>

          <div 
            onClick={handleOpenCard}
            className="relative w-[350px] h-[490px] mt-[-60px] mb-[-50px] z-20 select-none cursor-pointer group transition-transform duration-300"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          >
            {/* CLOSED COVER */}
            <div 
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-700 ease-in-out z-30 ${
                isOpening 
                  ? 'opacity-0 scale-95 pointer-events-none' 
                  : 'opacity-100 scale-100 hover:scale-101 animate-envelope-pulse'
              }`}
              style={{ backgroundImage: `url('https://content.pancake.vn/1/s750x1050/fwebp80/83/bf/ec/8c/773c7f08f555f31211f154f366ad6d216542348db720bd983c604278-w:1429-h:2000-l:151240-t:image/png.png')` }}
            />

            {/* OPENED INNER LAYERS */}
            {isOpening && (
              <div className="absolute inset-0 z-10">
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat z-10"
                  style={{ backgroundImage: `url('https://content.pancake.vn/1/s750x1050/fwebp80/94/28/c5/c9/8f35889fe59086f483fadc616f93739670fcefb71cc0752947effffc-w:1429-h:2000-l:177289-t:image/png.png')` }}
                />

                <div 
                  className={`absolute left-[58px] w-[234px] h-[216px] bg-white border border-white/90 p-1.5 shadow-md transition-all duration-[1300ms] z-[15] ${
                    isOpening 
                      ? 'bottom-[250px] opacity-100 scale-[1.03]' 
                      : 'bottom-[130px] opacity-0 scale-95'
                  }`}
                >
                  <div className="relative w-full h-full overflow-hidden border border-slate-100/60 bg-white">
                    {couplePhoto ? (
                      <img 
                        src={couplePhoto} 
                        alt="Wedding Couple" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#7d1f2a] flex items-center justify-center text-white font-title text-lg">L &amp; B</div>
                    )}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 text-[#dfbba3] stroke-current" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                      <rect x="4" y="4" width="92" height="92" strokeWidth="0.8" strokeDasharray="2 2"/>
                      <rect x="6" y="6" width="88" height="88" strokeWidth="0.8"/>
                      <path d="M 6 12 C 10 10, 10 10, 12 6" strokeWidth="1"/>
                      <path d="M 94 12 C 90 10, 90 10, 88 6" strokeWidth="1"/>
                      <path d="M 6 88 C 10 90, 10 90, 12 94" strokeWidth="1"/>
                      <path d="M 94 88 C 90 90, 90 90, 88 94" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>

                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat z-20 pointer-events-none"
                  style={{ backgroundImage: `url('https://content.pancake.vn/1/s750x1050/fwebp80/ea/cc/05/c7/614dc6422e15e725e2533702e8c99c1c50c2ec42034a8cfc7a883d2f-w:1429-h:2000-l:154686-t:image/png.png')` }}
                />
              </div>
            )}
          </div>

          <div className="text-center h-20 overflow-hidden relative w-full z-20">
            <p 
              className={`font-body text-xs text-slate-400 font-bold uppercase tracking-wider transition-all duration-500 absolute left-0 right-0 ${
                isOpening ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
              }`}
            >
              - NHẤP VÀO THIỆP ĐỂ MỞ -
            </p>

            <div 
              className={`transition-all duration-700 ease-out absolute left-0 right-0 space-y-2 ${
                isOpening ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-center gap-4 text-slate-800">
                <span className="font-script text-2xl font-bold">{wedding.groomShortName || 'Hữu Quân'}</span>
                <svg className="w-5 h-5 text-rose-600 animate-pulse fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-script text-2xl font-bold">{wedding.brideShortName || 'Đỗ Bắc'}</span>
              </div>
              
              <p className="font-title text-lg tracking-widest text-slate-600 font-bold leading-none">
                {formattedDay}.{formattedMonth} <span className="block text-sm text-slate-400 font-body font-bold mt-1">{year}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Invitation Content */}
      <div className={`w-full max-w-[480px] bg-white shadow-2xl min-h-screen relative overflow-x-hidden flex flex-col pb-16 transition-opacity duration-1000 ${isOpened ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        
        {/* Cover / Hero photo */}
        <div className="relative h-[550px] bg-slate-900 flex items-end justify-center text-white pb-8">
          {couplePhoto ? (
            <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${couplePhoto})` }}></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#7d1f2a] to-slate-900 opacity-80"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"></div>
          
          <div className="z-10 text-center px-4 w-full">
            <span className="font-script text-2xl text-[#dfbba3] italic">Save the Date</span>
            <h1 className="font-title text-3xl font-light tracking-widest mt-2 mb-1 uppercase">{wedding.groomName}</h1>
            <p className="font-script text-3xl italic text-[#dfbba3] my-0.5">&amp;</p>
            <h1 className="font-title text-3xl font-light tracking-widest mb-5 uppercase">{wedding.brideName}</h1>
            <p className="font-body text-[10px] text-slate-200 tracking-widest uppercase border-t border-b border-[#dfbba3]/30 py-1.5 inline-block px-6">
              {day} . {month} . {year}
            </p>
          </div>
        </div>

        {/* Section 2: Parent details */}
        <ScrollReveal>
          <div className="pt-10 pb-5 px-6 text-center bg-white border-b border-slate-100">
            <div className="mb-2">
              <h3 className="font-script text-4xl text-[#7d1f2a] mb-8">Gia Đình Hai Bên</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 font-body px-1">
                {/* Groom side */}
                <div className="flex flex-col border-r border-slate-100 pr-2">
                  <p className="font-bold text-[#7d1f2a] text-[10px] tracking-widest uppercase mb-3">NHÀ TRAI</p>
                  <p className="font-title text-sm font-semibold text-slate-800 leading-normal whitespace-nowrap">{wedding.groomFather || 'Ông: ...'}</p>
                  <p className="font-title text-sm font-semibold text-slate-800 leading-normal mb-3 whitespace-nowrap">{wedding.groomMother || 'Bà: ...'}</p>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed">Địa chỉ: {wedding.groomAddress || '...'}</p>
                </div>

                {/* Bride side */}
                <div className="flex flex-col pl-2">
                  <p className="font-bold text-[#7d1f2a] text-[10px] tracking-widest uppercase mb-3">NHÀ GÁI</p>
                  <p className="font-title text-sm font-semibold text-slate-800 leading-normal whitespace-nowrap">{wedding.brideFather || 'Ông: ...'}</p>
                  <p className="font-title text-sm font-semibold text-slate-800 leading-normal mb-3 whitespace-nowrap">{wedding.brideMother || 'Bà: ...'}</p>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed">Địa chỉ: {wedding.brideAddress || '...'}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Ported names & image thumbnails selector */}
        <ScrollReveal>
          <div className="py-10 px-6 text-center bg-white border-b border-slate-100 flex flex-col items-center">
            <p className="font-title text-base font-semibold text-slate-700 tracking-wider mb-6">
              Trân Trọng Báo Tin Lễ Thành Hôn Của
            </p>
            
            <div className="flex flex-col items-center justify-center mb-8">
              <p className="font-script text-[42px] text-slate-900 leading-none whitespace-nowrap">
                {wedding.groomName}
              </p>
              <p className="font-script text-3xl text-[#7d1f2a] my-2 leading-none">
                &amp;
              </p>
              <p className="font-script text-[42px] text-slate-900 leading-none whitespace-nowrap">
                {wedding.brideName}
              </p>
            </div>

            {albumPhotosList.length > 0 && (
              <div 
                onClick={() => setActivePhotoIdx(selectedAlbumPhotoIdx)}
                className="border-[3px] border-[#7d1f2a] rounded-3xl overflow-hidden shadow-lg w-full max-w-[320px] mx-auto mb-8 cursor-zoom-in group relative"
              >
                <img 
                  src={albumPhotosList[selectedAlbumPhotoIdx] || '/images/wedding_1.jpg'} 
                  alt="Wedding Couple" 
                  className="w-full h-auto object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                  <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            )}

            <p className="font-title text-lg font-semibold text-slate-700 tracking-wider mb-6">
              Trân Trọng Kính Mời
            </p>

            {sections.gallery && galleryPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 w-full max-w-[320px] mx-auto">
                {galleryPhotos.map((photo, idx) => {
                  const photoIdx = albumPhotosList.indexOf(photo);
                  const isActive = selectedAlbumPhotoIdx === photoIdx;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (photoIdx !== -1) {
                          setSelectedAlbumPhotoIdx(photoIdx);
                        }
                      }}
                      className={`h-28 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shadow-sm ${
                        isActive
                          ? 'border-[#7d1f2a] scale-105 shadow-md z-10'
                          : 'border-slate-100 hover:border-[#7d1f2a]'
                      }`}
                    >
                      <img 
                        src={photo} 
                        alt={`Thumbnail ${idx}`} 
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Section 3: Event details */}
        <ScrollReveal>
          <div className="py-10 px-6 bg-white border-b border-slate-100 flex flex-col items-center">
            <h3 className="font-script text-4xl text-[#7d1f2a] mb-12 text-center">Thời Gian &amp; Địa Điểm</h3>
            
            <div className="relative w-full max-w-[340px] pl-8 mx-auto">
              <div className="absolute left-[11px] top-3 bottom-3 w-[1.5px] bg-gradient-to-b from-[#7d1f2a]/30 via-[#dfbba3]/70 to-[#7d1f2a]/30"></div>

              {/* Event 1: Party */}
              {wedding.partyLocation && (
                <div className="relative mb-12 text-left">
                  <div className="absolute -left-[29px] top-1.5 h-6 w-6 rounded-full bg-[#fcf9f2] border border-[#7d1f2a]/30 flex items-center justify-center shadow-xs">
                    <svg className="w-3 h-3 text-[#7d1f2a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>

                  <div className="bg-white hover:shadow-md transition-all duration-300 p-5 rounded-2xl border border-slate-100/80">
                    <span className="text-[9px] font-bold text-[#7d1f2a] border border-[#7d1f2a]/25 bg-[#7d1f2a]/5 px-3 py-1 rounded-full uppercase tracking-wider font-body inline-block mb-3">
                      {wedding.partyTitle || 'Tiệc Mừng Cưới'}
                    </span>
                    <h4 className="font-title text-lg font-bold text-[#7d1f2a] tracking-wide mb-1 leading-snug">
                      {wedding.partyTime || '17:00'}
                    </h4>
                    <div className="mt-4 flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#7d1f2a] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-xs text-slate-600 font-body leading-relaxed">
                        {wedding.partyLocation}
                      </p>
                    </div>

                    {wedding.partyMapLink && (
                      <a 
                        href={wedding.partyMapLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-4 text-[9px] font-bold text-[#7d1f2a] font-body tracking-wider hover:underline btn-gold-sweep border border-[#7d1f2a]/20 rounded-full px-4 py-1.5 bg-[#fcf9f2] shadow-xs"
                      >
                        XEM BẢN ĐỒ ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Event 2: Ceremony */}
              {wedding.ceremonyLocation && (
                <div className="relative text-left">
                  <div className="absolute -left-[29px] top-1.5 h-6 w-6 rounded-full bg-[#fcf9f2] border border-[#7d1f2a]/30 flex items-center justify-center shadow-xs">
                    <svg className="w-3 h-3 text-[#7d1f2a]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="bg-white hover:shadow-md transition-all duration-300 p-5 rounded-2xl border border-slate-100/80">
                    <span className="text-[9px] font-bold text-[#7d1f2a] border border-[#7d1f2a]/25 bg-[#7d1f2a]/5 px-3 py-1 rounded-full uppercase tracking-wider font-body inline-block mb-3">
                      {wedding.ceremonyTitle || 'Lễ Tân Hôn'}
                    </span>
                    <h4 className="font-title text-lg font-bold text-[#7d1f2a] tracking-wide mb-1 leading-snug">
                      {wedding.ceremonyTime || '11:00'}
                    </h4>
                    <div className="mt-4 flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#7d1f2a] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-xs text-slate-600 font-body leading-relaxed">
                        {wedding.ceremonyLocation}
                      </p>
                    </div>

                    {wedding.ceremonyMapLink && (
                      <a 
                        href={wedding.ceremonyMapLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-4 text-[9px] font-bold text-[#7d1f2a] font-body tracking-wider hover:underline btn-gold-sweep border border-[#7d1f2a]/20 rounded-full px-4 py-1.5 bg-[#fcf9f2] shadow-xs"
                      >
                        XEM BẢN ĐỒ ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Section 4: Calendar */}
        {sections.calendar && (
          <ScrollReveal>
            <div className="py-10 px-6 bg-white border-b border-slate-100 flex flex-col items-center">
              <h3 className="font-title text-2xl text-[#7d1f2a] font-bold tracking-widest uppercase mb-2">Tháng {month}</h3>
              <p className="font-body text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Năm {year}</p>
              
              <div className="border border-slate-100 bg-white p-6 rounded-3xl shadow-sm w-full max-w-[340px]">
                <div className="grid grid-cols-7 gap-2 mb-3 text-center text-[10px] font-bold text-slate-400 font-body">
                  <div>CN</div>
                  <div>T2</div>
                  <div>T3</div>
                  <div>T4</div>
                  <div>T5</div>
                  <div>T6</div>
                  <div>T7</div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {renderCalendarDays()}
                </div>
              </div>

              {/* Countdown Timer */}
              {timeLeft.total > 0 && (
                <div className="mt-8 flex flex-col items-center">
                  <p className="font-body text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                    Đếm ngược thời gian tới lễ cưới
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center bg-[#faf6f0] border border-[#ebdcb9]/40 w-[60px] h-[65px] rounded-2xl shadow-xs">
                      <span className="font-title text-xl font-bold text-[#7d1f2a]">{timeLeft.days}</span>
                      <span className="text-[9px] font-bold text-slate-400 font-body uppercase mt-0.5">Ngày</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-[#faf6f0] border border-[#ebdcb9]/40 w-[60px] h-[65px] rounded-2xl shadow-xs">
                      <span className="font-title text-xl font-bold text-[#7d1f2a]">{timeLeft.hours}</span>
                      <span className="text-[9px] font-bold text-slate-400 font-body uppercase mt-0.5">Giờ</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-[#faf6f0] border border-[#ebdcb9]/40 w-[60px] h-[65px] rounded-2xl shadow-xs">
                      <span className="font-title text-xl font-bold text-[#7d1f2a]">{timeLeft.minutes}</span>
                      <span className="text-[9px] font-bold text-slate-400 font-body uppercase mt-0.5">Phút</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-[#faf6f0] border border-[#ebdcb9]/40 w-[60px] h-[65px] rounded-2xl shadow-xs">
                      <span className="font-title text-xl font-bold text-[#7d1f2a]">{timeLeft.seconds}</span>
                      <span className="text-[9px] font-bold text-slate-400 font-body uppercase mt-0.5">Giây</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Section 5: Maps Embed */}
        {sections.maps && (wedding.partyMapIframe || wedding.ceremonyMapIframe) && (
          <ScrollReveal>
            <div className="py-10 px-6 bg-white border-b border-slate-100 text-center">
              <h3 className="font-script text-4xl text-[#7d1f2a] mb-8">Địa Điểm Trên Bản Đồ</h3>
              {wedding.partyMapIframe ? (
                <MapSection iframeHtml={wedding.partyMapIframe} />
              ) : wedding.ceremonyMapIframe ? (
                <MapSection iframeHtml={wedding.ceremonyMapIframe} />
              ) : null}
            </div>
          </ScrollReveal>
        )}

        {/* Section 7: RSVP Form */}
        {sections.rsvp && (
          <ScrollReveal>
            <div className="py-10 px-6 bg-white border-b border-slate-100">
              <div className="text-center mb-8">
                <h3 className="font-script text-4xl text-[#7d1f2a] mb-2">Xác Nhận Tham Dự</h3>
                <p className="text-xs text-slate-400 font-body">Sự hiện diện của quý khách là niềm vinh hạnh lớn!</p>
              </div>

              <form onSubmit={handleRsvpSubmit} className="space-y-5 font-body">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tên khách mời *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Tên của bạn..."
                    value={rsvpForm.guest_name}
                    onChange={e => setRsvpForm({ ...rsvpForm, guest_name: e.target.value })}
                    className="w-full text-sm border-slate-200 rounded-xl px-4 py-2.5 focus:border-[#7d1f2a] focus:ring focus:ring-[#7d1f2a]/20"
                  />
                </div>

                <div className="relative font-body" ref={relationRef}>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bạn là khách của? *</label>
                  
                  <button
                    type="button"
                    onClick={() => setIsRelationOpen(!isRelationOpen)}
                    className="w-full flex items-center justify-between text-left text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:border-[#7d1f2a] focus:ring focus:ring-[#7d1f2a]/20 transition-all shadow-xs"
                  >
                    <span className={rsvpForm.relation ? "text-slate-800 font-medium" : "text-slate-400"}>
                      {relationOptions.find(opt => opt.value === rsvpForm.relation)?.label || '-- Chọn quan hệ --'}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isRelationOpen ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isRelationOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 z-40 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                      {relationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setRsvpForm({ ...rsvpForm, relation: opt.value });
                            setIsRelationOpen(false);
                          }}
                          className={`w-full text-left text-xs font-semibold px-4 py-3 border-b border-slate-50 last:border-b-0 transition-colors ${
                            rsvpForm.relation === opt.value
                              ? 'bg-[#7d1f2a] text-white'
                              : 'text-slate-600 hover:bg-[#7d1f2a]/5 hover:text-[#7d1f2a]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bạn có tham dự được không? *</label>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <button
                      type="button"
                      onClick={() => setRsvpForm({ ...rsvpForm, attendance_status: 'attending' })}
                      className={`py-3 px-3 text-xs font-semibold rounded-xl border transition-all ${
                        rsvpForm.attendance_status === 'attending'
                          ? 'bg-[#7d1f2a] text-white border-[#7d1f2a] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Có, mình sẽ đến!
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpForm({ ...rsvpForm, attendance_status: 'absent' })}
                      className={`py-3 px-3 text-xs font-semibold rounded-xl border transition-all ${
                        rsvpForm.attendance_status === 'absent'
                          ? 'bg-[#7d1f2a] text-white border-[#7d1f2a] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Tiếc quá, bận mất rồi
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Gửi lời chúc tốt đẹp nhất</label>
                  <textarea 
                    rows={3}
                    placeholder="Lời chúc ý nghĩa dành cho Dâu Rể..."
                    value={rsvpForm.wishes}
                    onChange={e => setRsvpForm({ ...rsvpForm, wishes: e.target.value })}
                    className="w-full text-sm border-slate-200 rounded-xl px-4 py-2.5 focus:border-[#7d1f2a] focus:ring focus:ring-[#7d1f2a]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRsvpSubmitting}
                  className="w-full bg-[#7d1f2a] hover:bg-[#681922] text-white font-bold font-body tracking-wider py-3.5 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:bg-slate-300 btn-gold-sweep"
                >
                  {isRsvpSubmitting ? 'ĐANG GỬI...' : 'GỬI LỜI XÁC NHẬN'}
                </button>

                {rsvpMessage && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100 text-center">
                    {rsvpMessage}
                  </div>
                )}

                {rsvpError && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-100 text-center">
                    {rsvpError}
                  </div>
                )}
              </form>
            </div>
          </ScrollReveal>
        )}

        {/* Section 8: Gift Box / Bank Transfers */}
        {sections.gift && wedding.bankAccount && (
          <ScrollReveal>
            <div className="py-10 px-6 bg-white text-center flex flex-col items-center">
              <h3 className="font-script text-4xl text-[#7d1f2a] mb-4">Gửi Mừng Cưới</h3>
              <p className="text-xs font-body text-slate-500 max-w-[280px] mb-8 leading-relaxed">
                Nếu bạn muốn gửi quà mừng cưới trực tiếp, bạn có thể quét mã QR chuyển khoản hoặc xem thông tin tài khoản bên dưới.
              </p>
              
              <button
                onClick={() => setShowGiftModal(true)}
                className="bg-[#7d1f2a] hover:bg-[#681922] text-white font-bold font-body py-3.5 px-8 rounded-full text-xs tracking-wider shadow-md flex items-center gap-2 transition-all btn-gold-sweep"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                XEM SỐ TÀI KHOẢN &amp; QR
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Footer */}
        <div className="py-8 px-6 text-center bg-white border-t border-slate-100 font-body flex flex-col items-center justify-center">
          <p className="font-script text-2xl text-[#7d1f2a]">
            Cảm ơn quý khách đã đến chung vui cùng gia đình chúng tôi!
          </p>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {activePhotoIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setActivePhotoIdx(null)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 z-50 font-bold"
            aria-label="Close Lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button 
            onClick={() => setActivePhotoIdx((activePhotoIdx - 1 + albumPhotosList.length) % albumPhotosList.length)}
            className="absolute left-6 text-white hover:text-slate-300 p-2 z-10"
            aria-label="Previous Photo"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="max-w-full max-h-full flex items-center justify-center p-4">
            <img 
              src={albumPhotosList[activePhotoIdx]} 
              alt={`Photo ${activePhotoIdx}`} 
              className="max-w-[90vw] max-h-[85vh] object-contain rounded border border-slate-850"
            />
          </div>

          <button 
            onClick={() => setActivePhotoIdx((activePhotoIdx + 1) % albumPhotosList.length)}
            className="absolute right-6 text-white hover:text-slate-300 p-2 z-10"
            aria-label="Next Photo"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Gift Modal Popup */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-[340px] overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease-out] border border-slate-100">
            <div className="bg-[#7d1f2a] text-white p-5 text-center relative font-title">
              <h4 className="text-lg">Thông Tin Mừng Cưới</h4>
              <button 
                onClick={() => setShowGiftModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
                aria-label="Close Gift Modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 text-center font-body flex flex-col items-center justify-center space-y-4">
              {wedding.bankAccount && (
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Quét mã để chuyển khoản nhanh</p>
                  <div className="h-56 w-56 border border-slate-200 p-2 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                    <img 
                      src="/images/qr_code.png" 
                      alt="QR code" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
